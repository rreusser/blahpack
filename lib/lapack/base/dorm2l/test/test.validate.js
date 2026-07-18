/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dorm2l, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `orm2l` (UNBLOCKED apply-Q) ->
* overwrite the M-by-N matrix C with op(Q)*C (side='left') or C*op(Q)
* (side='right'), where Q = H(k)...H(2)H(1) is the orthogonal factor of a QL
* factorization (reflectors + TAU as returned by DGEQLF), and op(Q) is Q
* (trans='no-transpose') or Qᵀ (trans='transpose').
*
* Oracle (INDEPENDENT cross-validation, recorded as 'reconstruct' at L2): form
* the EXPLICIT orthogonal Q from the SAME reflectors via `dorgql` (a separately
* validated routine), then compute op(Q)*C0 / C0*op(Q) with the harness's naive
* `ref.matmul` and compare to dorm2l's in-place output. Because dorgql forms Q by
* an independent code path, a systematic reflector/side/trans error in dorm2l
* would disagree with the oracle.
*
* QL storage (dgeqlf on an R×K panel, R>=K, k=K): reflector i is in column i with
* pivot row p = R-K+i, essential v ABOVE the pivot (implicit 1 at the pivot). The
* full square R×R Q is formed by dorgql(R,R,K), which expects reflector i in
* column R-K+i (last K columns) with pivot row R-K+i — SAME pivot — so the panel's
* column i is copied into the R×R matrix's column R-K+i.
*
* dorm2l is the UNBLOCKED (level-2) kernel: its inner dlarf calls the optimized
* dgemv/dger, which selects its summation form by comparing operand strides, so
* bit-exact layout invariance holds only WITHIN a storage-order family (col vs
* row); cross-order correctness is certified by the property swept over ALL
* layouts. (See test/harness/LEARNINGS.md, dpotf2 col/row entry.)
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { poisonedWork } from '../../../../../test/harness/workspace.js';
import dorm2l from './../lib/ndarray.js';
import dgeqlf from '../../dgeqlf/lib/ndarray.js';
import dorgql from '../../dorgql/lib/ndarray.js';

const sc = S.real; // d-routine
const NAME = 'dorm2l';
const TRANS_T = 'transpose'; // op(Q) = Qᵀ for a real routine
const TCODE_T = 't'; // matmul transpose code matching TRANS_T
const LogicalMatrix = logical.LogicalMatrix;
const NB = 32;

// (M,N,K) triples with K <= min(M,N) (valid for BOTH side='left' [Q is M×M from
// an M×K panel] and side='right' [Q is N×N from an N×K panel]). Small/medium +
// zero/trivial corners; dorm2l is always unblocked so no NB threshold matters.
const TRIPLES = [
	[ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 2, 2 ], [ 2, 3, 1 ], [ 4, 4, 2 ],
	[ 5, 4, 3 ], [ 3, 5, 3 ], [ 7, 7, 4 ], [ 8, 5, 5 ], [ 5, 8, 4 ],
	[ 15, 10, 7 ], [ 16, 16, 8 ], [ 17, 12, 10 ], [ 31, 20, 15 ],
	[ 33, 33, 17 ], [ 17, 33, 16 ],
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

// WORK the geqlf ndarray needs for an R×K panel (R>=K, k=K): blocked when K>NB.
function geqlfWork( K ) {
	return ( K > NB ) ? ( ( K * NB ) + ( NB * NB ) ) : Math.max( 1, K );
}

// WORK for the UNBLOCKED apply: nw = N (left) or M (right).
function ormWork( side, M, N ) {
	return ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
}

// Form the EXPLICIT R×R orthogonal Q from the K reflectors packed in the
// geqlf-factored panel `Ard` (R×K) + tau vector `Tvec`, via the independent
// dorgql. QL storage: reflector i (panel column i) maps to R×R column R-K+i.
function formQ( Ard, Tvec, R, K ) {
	const Qlog = new LogicalMatrix( sc, R, R );
	let pc, i, j;
	for ( j = 0; j < R; j++ ) {
		pc = j - ( R - K ); // panel column feeding R×R column j (last K columns)
		for ( i = 0; i < R; i++ ) {
			Qlog.set( i, j, ( pc >= 0 ) ? Ard.read( i, pc ) : sc.zero );
		}
	}
	const Qr = schemes.dense.realize( sc, Qlog, { 'part': 'full' }, null );
	const Wr = poisonedWork( sc, ( K > NB ) ? ( R * NB ) : R );
	dorgql( R, R, K, Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Qr.args[ 2 ], Tvec.data, Tvec.args[ 0 ], Tvec.args[ 1 ], Wr, 1, 0 );
	return readFull( Qr, R, R );
}

function seedFor( M, N, K, side ) {
	return ( 0x100 + ( M * 1000 ) + ( N * 10 ) + K + ( side === 'left' ? 0 : 7 ) ) >>> 0;
}

// Drive one property case: factor an R×K panel, apply op(Q) to C0 with dorm2l,
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
		dgeqlf( R, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, geqlfWork( K ) ), 1, 0 );
	}
	const C0 = logical.general( sc, rng, M, N );
	const Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );

	dorm2l( side, trans, M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, ormWork( side, M, N ) ), 1, 0 );

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

// Read tau values out of a realized tau vector into a plain array of scalars.
function tauValues( Tvec, K ) {
	const a = [];
	let i;
	for ( i = 0; i < K; i++ ) {
		a.push( Tvec.read( i ) );
	}
	return a;
}


// TESTS //

// Step 2/5: PROPERTY. op(Q) applied by dorm2l == explicit-Q oracle, swept over
// side × trans × (M,N,K) × dense layouts.
test( 'dorm2l: op(Q)·C matches explicit-Q oracle (side × trans × dims × layouts)', function t() {
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


// Step 3: LAYOUT INVARIANCE. Freeze the reflectors + tau + C0, then re-realize A
// and C per layout and run ONLY dorm2l; assert bit-exact output WITHIN a
// storage-order family (col / row). The optimized dgemv/dger inside dlarf
// reorders across the col<->row flip, so cross-family equality is NOT expected
// (covered by the property above).
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
const VEC_LAYOUTS = schemes.vectorLayouts();

test( 'dorm2l: bit-exact within storage-order family (col / row)', function t() {
	const M = 17;
	const N = 13;
	const K = 11; // unblocked
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
			const R = ( side === 'left' ) ? M : N;
			const rng = new RNG( seedFor( M, N, K, side ) );
			const panel = logical.general( sc, rng, R, K );
			const A0 = schemes.dense.realize( sc, panel, { 'part': 'full' }, null );
			const tau0 = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
			let Alog, C0;
			dgeqlf( R, K, A0.data, A0.args[ 0 ], A0.args[ 1 ], A0.args[ 2 ], tau0.data, tau0.args[ 0 ], tau0.args[ 1 ], poisonedWork( sc, geqlfWork( K ) ), 1, 0 );
			Alog = readFull( A0, R, K ); // frozen reflectors (R×K)
			C0 = logical.general( sc, rng, M, N ); // frozen C0

			[ [ colLayouts, 'col' ], [ rowLayouts, 'row' ] ].forEach( function eachFam( fam ) {
				checked( NAME, 'layout-invariance', function run() {
					layoutInvariant( fam[ 0 ], function build( layout, i ) {
						const Ar = schemes.dense.realize( sc, Alog, { 'part': 'full' }, layout );
						const Tr = schemes.realizeVector( sc, tauValues( tau0, K ), VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
						const Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
						dorm2l( side, tc[ 0 ], M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, ormWork( side, M, N ) ), 1, 0 );
						return check.flattenLogical( sc, readFull( Cr, M, N ) );
					}, { 'label': NAME + ' side=' + side + ' trans=' + tc[ 0 ] + ' ' + fam[ 1 ] + '-major invariance' } );
				} );
			} );
		} );
	} );
} );
