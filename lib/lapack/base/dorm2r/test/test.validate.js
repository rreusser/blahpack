/**
* Property-based validation for dorm2r, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `orm2r` (UNBLOCKED apply-Q) ->
* overwrite the M-by-N matrix C with op(Q)*C (side='left') or C*op(Q)
* (side='right'), where Q = H(1)*H(2)*...*H(K) is the orthogonal factor of a QR
* factorization (reflectors + TAU as returned by DGEQR2/DGEQRF), and op(Q) is Q
* (trans='no-transpose') or Qᵀ (trans='transpose').
*
* Oracle (INDEPENDENT cross-validation, recorded as 'reconstruct' at L2): form
* the EXPLICIT orthogonal Q from the SAME reflectors via `dorgqr` (a separately
* validated routine), then compute op(Q)*C0 / C0*op(Q) with the harness's naive
* `ref.matmul` and compare to dorm2r's in-place output. Because dorgqr forms Q by
* an independent code path (dorg2r), a systematic reflector/side/trans error in
* dorm2r would disagree with the oracle.
*
* dorm2r is UNBLOCKED (delegates to dlarf), so its inner kernel is the optimized
* dgemv/dger, which selects its summation form by comparing operand strides:
* therefore bit-exact layout invariance holds only WITHIN a storage-order family
* (col vs row), and cross-order correctness is certified by the property swept
* over ALL layouts. (See test/harness/LEARNINGS.md, dpotf2 col/row entry.)
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dorm2r from './../lib/ndarray.js';
import dgeqrf from '../../dgeqrf/lib/ndarray.js';
import dorgqr from '../../dorgqr/lib/ndarray.js';

const sc = S.real; // d-routine
const NAME = 'dorm2r';
const TRANS_T = 'transpose'; // op(Q) = Qᵀ for a real routine
const TCODE_T = 't'; // matmul transpose code matching TRANS_T
const LogicalMatrix = logical.LogicalMatrix;
const NB = 32;

// (M,N,K) triples with K <= min(M,N) (valid for BOTH side='left' [Q is M×M from
// an M×K panel] and side='right' [Q is N×N from an N×K panel]). Small/medium +
// zero/trivial corners; dorm2r is unblocked so no NB threshold matters here, but
// K spans 0..min including K>NB to be safe.
const TRIPLES = [
	[ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 2, 2 ], [ 2, 3, 1 ], [ 4, 4, 2 ],
	[ 5, 4, 3 ], [ 3, 5, 3 ], [ 7, 7, 4 ], [ 8, 5, 5 ], [ 5, 8, 4 ],
	[ 15, 10, 7 ], [ 16, 16, 8 ], [ 17, 12, 10 ], [ 31, 20, 15 ],
	[ 33, 33, 17 ], [ 17, 33, 16 ], [ 40, 40, 35 ], [ 48, 40, 40 ],
	[ 4, 4, 0 ], [ 0, 3, 0 ], [ 3, 0, 0 ], [ 0, 0, 0 ]
];

const ALL_LAYOUTS = schemes.dense.layouts();
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// A poisoned (NaN) vector of scalar values.
function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Read a realized dense matrix back into a LogicalMatrix.
function readFull( Ard, rows, cols ) {
	const F = new LogicalMatrix( sc, rows, cols );
	let i, j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}

// WORK the geqrf ndarray needs for an R×K panel (R>=K): blocked when K>NB.
function geqrfWork( R, K ) {
	return ( Math.min( R, K ) > NB ) ? ( ( K * NB ) + ( NB * NB ) ) : Math.max( 1, K );
}

// Generous WORK superset for the orm apply (covers unblocked nw and blocked
// nw*NB+(NB+1)*NB): nw = N (left) or M (right).
function ormWork( side, M, N ) {
	const nw = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	return ( nw * NB ) + ( ( NB + 1 ) * NB );
}

// Form the EXPLICIT R×R orthogonal Q from the K reflectors packed in the
// geqrf-factored panel `Ard` (R×K) + tau vector `Tvec`, via the independent
// dorgqr. Returns Q as a LogicalMatrix.
function formQ( Ard, Tvec, R, K ) {
	const Qlog = new LogicalMatrix( sc, R, R );
	let i, j;
	for ( j = 0; j < R; j++ ) {
		for ( i = 0; i < R; i++ ) {
			Qlog.set( i, j, ( j < K ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	const Qr = schemes.dense.realize( sc, Qlog, { 'part': 'full' }, null );
	const Wr = poisonedWork( sc, ( R * NB ) + ( NB * NB ) );
	dorgqr( R, R, K, Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Qr.args[ 2 ], Tvec.data, Tvec.args[ 0 ], Tvec.args[ 1 ], Wr, 1, 0 );
	return readFull( Qr, R, R );
}

function seedFor( M, N, K, side ) {
	return ( 0x100 + ( M * 1000 ) + ( N * 10 ) + K + ( side === 'left' ? 0 : 7 ) ) >>> 0;
}

// Drive one property case: factor an R×K panel, apply op(Q) to C0 with dorm2r,
// and compare to the explicit-Q oracle. Returns { got, expected, label }.
function runCase( M, N, K, side, trans, tcode, layout ) {
	const R = ( side === 'left' ) ? M : N;
	const rng = new RNG( seedFor( M, N, K, side ) );
	const active = ( M > 0 && N > 0 && K > 0 );
	const panel = logical.general( sc, rng, R, K );
	const Ar = schemes.dense.realize( sc, panel, { 'part': 'full' }, layout );
	const Tr = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
	let expected, Q;
	if ( active ) {
		dgeqrf( R, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, geqrfWork( R, K ) ), 1, 0 );
	}
	const C0 = logical.general( sc, rng, M, N );
	const Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
	const Wo = poisonedWork( sc, ormWork( side, M, N ) );

	dorm2r( side, trans, M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );

	if ( active ) {
		Q = formQ( Ar, Tr, R, K );
		expected = ( side === 'left' ) ? ref.matmul( sc, Q, C0, { 'transa': tcode } ) : ref.matmul( sc, C0, Q, { 'transb': tcode } );
	} else {
		expected = C0; // op(Q) = I (K=0) or empty (M=0/N=0)
	}
	return {
		'got': readFull( Cr, M, N ),
		'expected': expected,
		'label': NAME + ' side=' + side + ' trans=' + trans + ' M=' + M + ' N=' + N + ' K=' + K
	};
}


// Step 2/5: PROPERTY. op(Q) applied by dorm2r == explicit-Q oracle, swept over
// side × trans × (M,N,K) × dense layouts (all layouts for small/medium dims,
// tight only for large).
test( 'dorm2r: op(Q)·C matches explicit-Q oracle (side × trans × dims × layouts)', function t() {
	TRIPLES.forEach( function eachT( tr ) {
		const M = tr[ 0 ];
		const N = tr[ 1 ];
		const K = tr[ 2 ];
		const layouts = ( Math.max( M, N ) <= 33 ) ? ALL_LAYOUTS : [ null ];
		[ 'left', 'right' ].forEach( function eachSide( side ) {
			[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
				layouts.forEach( function eachLayout( layout, li ) {
					const r = runCase( M, N, K, side, tc[ 0 ], tc[ 1 ], layout );
					checked( NAME, 'reconstruct', function run() {
						check.assertReconstruct( sc, r.got, r.expected, { 'factor': 100, 'label': r.label + ' layout=' + li } );
					} );
				} );
			} );
		} );
	} );
} );


// Step 3: LAYOUT INVARIANCE. Freeze the reflectors + tau + C0 (compute the
// factorization ONCE, tight), then re-realize A and C per layout and run ONLY
// dorm2r; assert bit-exact output WITHIN a storage-order family (col / row). The
// optimized dgemv/dger inside dlarf reorders across the col<->row flip, so
// cross-family equality is NOT expected (and is covered by the property above).
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
const VEC_LAYOUTS = schemes.vectorLayouts();

test( 'dorm2r: bit-exact within storage-order family (col / row)', function t() {
	const M = 17;
	const N = 12;
	const K = 10; // unblocked (K <= NB)
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
			const R = ( side === 'left' ) ? M : N;
			const rng = new RNG( seedFor( M, N, K, side ) );
			const panel = logical.general( sc, rng, R, K );
			const A0 = schemes.dense.realize( sc, panel, { 'part': 'full' }, null );
			const tau0 = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
			let Alog, C0;
			dgeqrf( R, K, A0.data, A0.args[ 0 ], A0.args[ 1 ], A0.args[ 2 ], tau0.data, tau0.args[ 0 ], tau0.args[ 1 ], poisonedWork( sc, geqrfWork( R, K ) ), 1, 0 );
			Alog = readFull( A0, R, K ); // frozen reflectors (R×K)
			C0 = logical.general( sc, rng, M, N ); // frozen C0

			[ [ colLayouts, 'col' ], [ rowLayouts, 'row' ] ].forEach( function eachFam( fam ) {
				checked( NAME, 'layout-invariance', function run() {
					layoutInvariant( fam[ 0 ], function build( layout, i ) {
						const Ar = schemes.dense.realize( sc, Alog, { 'part': 'full' }, layout );
						const Tr = schemes.realizeVector( sc, tauValues( tau0, K ), VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
						const Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
						const Wo = poisonedWork( sc, ormWork( side, M, N ) );
						dorm2r( side, tc[ 0 ], M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
						return check.flattenLogical( sc, readFull( Cr, M, N ) );
					}, { 'label': NAME + ' side=' + side + ' trans=' + tc[ 0 ] + ' ' + fam[ 1 ] + '-major invariance' } );
				} );
			} );
		} );
	} );
} );

// Read tau values out of a realized tau vector into a plain array of scalars.
function tauValues( Tvec, K ) {
	const a = [];
	let i;
	for ( i = 0; i < K; i++ ) {
		a.push( Tvec.read( i ) );
	}
	return a;
}
