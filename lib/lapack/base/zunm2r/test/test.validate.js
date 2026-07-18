/**
* Property-based validation for zunm2r, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `unm2r` (UNBLOCKED apply-Q) ->
* overwrite the M-by-N matrix C with op(Q)*C (side='left') or C*op(Q)
* (side='right'), where Q = H(1)*H(2)*...*H(K) is the unitary factor of a QR
* factorization (reflectors + TAU as returned by ZGEQR2/ZGEQRF), and op(Q) is Q
* (trans='no-transpose') or Qᴴ (trans='conjugate-transpose').
*
* Oracle (INDEPENDENT cross-validation, recorded as 'reconstruct' at L2): form
* the EXPLICIT unitary Q from the SAME reflectors via `zungqr` (a separately
* validated routine), then compute op(Q)*C0 / C0*op(Q) with the harness's naive
* `ref.matmul` and compare to zunm2r's in-place output. Because zungqr forms Q by
* an independent code path (zung2r), a systematic reflector/side/trans error in
* zunm2r would disagree with the oracle. The complex conjugation of both TAU (Qᴴ)
* and the reflector inner products is exercised by the conjugate-transpose sweep.
*
* zunm2r is UNBLOCKED (delegates to zlarf), so its inner kernel is the optimized
* zgemv/zgeru, which selects its summation form by comparing operand strides:
* therefore bit-exact layout invariance holds only WITHIN a storage-order family
* (col vs row), and cross-order correctness is certified by the property swept
* over ALL layouts. (See test/harness/LEARNINGS.md, dpotf2 col/row entry.)
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zunm2r from './../lib/ndarray.js';
import zgeqrf from '../../zgeqrf/lib/ndarray.js';
import zungqr from '../../zungqr/lib/ndarray.js';

var sc = S.complex; // z-routine
var NAME = 'zunm2r';
var TRANS_T = 'conjugate-transpose'; // op(Q) = Qᴴ for a complex routine
var TCODE_T = 'c'; // matmul transpose code matching TRANS_T
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32;

// (M,N,K) triples with K <= min(M,N) (valid for BOTH side='left' [Q is M×M from
// an M×K panel] and side='right' [Q is N×N from an N×K panel]). Small/medium +
// zero/trivial corners; zunm2r is unblocked so no NB threshold matters here, but
// K spans 0..min including K>NB to be safe.
var TRIPLES = [
	[ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 2, 2 ], [ 2, 3, 1 ], [ 4, 4, 2 ],
	[ 5, 4, 3 ], [ 3, 5, 3 ], [ 7, 7, 4 ], [ 8, 5, 5 ], [ 5, 8, 4 ],
	[ 15, 10, 7 ], [ 16, 16, 8 ], [ 17, 12, 10 ], [ 31, 20, 15 ],
	[ 33, 33, 17 ], [ 17, 33, 16 ], [ 40, 40, 35 ], [ 48, 40, 40 ],
	[ 4, 4, 0 ], [ 0, 3, 0 ], [ 3, 0, 0 ], [ 0, 0, 0 ]
];

var ALL_LAYOUTS = schemes.dense.layouts();
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// A poisoned (NaN) vector of scalar values.
function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Read a realized dense matrix back into a LogicalMatrix.
function readFull( Ard, rows, cols ) {
	var F = new LogicalMatrix( sc, rows, cols );
	var i;
	var j;
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
	var nw = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	return ( nw * NB ) + ( ( NB + 1 ) * NB );
}

// Form the EXPLICIT R×R orthogonal Q from the K reflectors packed in the
// geqrf-factored panel `Ard` (R×K) + tau vector `Tvec`, via the independent
// zungqr. Returns Q as a LogicalMatrix.
function formQ( Ard, Tvec, R, K ) {
	var Qlog = new LogicalMatrix( sc, R, R );
	var Qr;
	var Wr;
	var i;
	var j;
	for ( j = 0; j < R; j++ ) {
		for ( i = 0; i < R; i++ ) {
			Qlog.set( i, j, ( j < K ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	Qr = schemes.dense.realize( sc, Qlog, { 'part': 'full' }, null );
	Wr = poisonedWork( sc, ( R * NB ) + ( NB * NB ) );
	zungqr( R, R, K, Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Qr.args[ 2 ], Tvec.data, Tvec.args[ 0 ], Tvec.args[ 1 ], Wr, 1, 0 );
	return readFull( Qr, R, R );
}

function seedFor( M, N, K, side ) {
	return ( 0x100 + ( M * 1000 ) + ( N * 10 ) + K + ( side === 'left' ? 0 : 7 ) ) >>> 0;
}

// Drive one property case: factor an R×K panel, apply op(Q) to C0 with zunm2r,
// and compare to the explicit-Q oracle. Returns { got, expected, label }.
function runCase( M, N, K, side, trans, tcode, layout ) {
	var R = ( side === 'left' ) ? M : N;
	var rng = new RNG( seedFor( M, N, K, side ) );
	var active = ( M > 0 && N > 0 && K > 0 );
	var panel = logical.general( sc, rng, R, K );
	var Ar = schemes.dense.realize( sc, panel, { 'part': 'full' }, layout );
	var Tr = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
	var C0;
	var Cr;
	var Wo;
	var expected;
	var Q;
	if ( active ) {
		zgeqrf( R, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, geqrfWork( R, K ) ), 1, 0 );
	}
	C0 = logical.general( sc, rng, M, N );
	Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
	Wo = poisonedWork( sc, ormWork( side, M, N ) );

	zunm2r( side, trans, M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );

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


// Step 2/5: PROPERTY. op(Q) applied by zunm2r == explicit-Q oracle, swept over
// side × trans × (M,N,K) × dense layouts (all layouts for small/medium dims,
// tight only for large).
test( 'zunm2r: op(Q)·C matches explicit-Q oracle (side × trans × dims × layouts)', function t() {
	TRIPLES.forEach( function eachT( tr ) {
		var M = tr[ 0 ];
		var N = tr[ 1 ];
		var K = tr[ 2 ];
		var layouts = ( Math.max( M, N ) <= 33 ) ? ALL_LAYOUTS : [ null ];
		[ 'left', 'right' ].forEach( function eachSide( side ) {
			[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
				layouts.forEach( function eachLayout( layout, li ) {
					var r = runCase( M, N, K, side, tc[ 0 ], tc[ 1 ], layout );
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
// zunm2r; assert bit-exact output WITHIN a storage-order family (col / row). The
// optimized dgemv/dger inside dlarf reorders across the col<->row flip, so
// cross-family equality is NOT expected (and is covered by the property above).
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
var VEC_LAYOUTS = schemes.vectorLayouts();

test( 'zunm2r: bit-exact within storage-order family (col / row)', function t() {
	var M = 17;
	var N = 12;
	var K = 10; // unblocked (K <= NB)
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
			var R = ( side === 'left' ) ? M : N;
			var rng = new RNG( seedFor( M, N, K, side ) );
			var panel = logical.general( sc, rng, R, K );
			var A0 = schemes.dense.realize( sc, panel, { 'part': 'full' }, null );
			var tau0 = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
			var Alog;
			var C0;
			zgeqrf( R, K, A0.data, A0.args[ 0 ], A0.args[ 1 ], A0.args[ 2 ], tau0.data, tau0.args[ 0 ], tau0.args[ 1 ], poisonedWork( sc, geqrfWork( R, K ) ), 1, 0 );
			Alog = readFull( A0, R, K ); // frozen reflectors (R×K)
			C0 = logical.general( sc, rng, M, N ); // frozen C0

			[ [ colLayouts, 'col' ], [ rowLayouts, 'row' ] ].forEach( function eachFam( fam ) {
				checked( NAME, 'layout-invariance', function run() {
					layoutInvariant( fam[ 0 ], function build( layout, i ) {
						var Ar = schemes.dense.realize( sc, Alog, { 'part': 'full' }, layout );
						var Tr = schemes.realizeVector( sc, tauValues( tau0, K ), VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
						var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
						var Wo = poisonedWork( sc, ormWork( side, M, N ) );
						zunm2r( side, tc[ 0 ], M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
						return check.flattenLogical( sc, readFull( Cr, M, N ) );
					}, { 'label': NAME + ' side=' + side + ' trans=' + tc[ 0 ] + ' ' + fam[ 1 ] + '-major invariance' } );
				} );
			} );
		} );
	} );
} );

// Read tau values out of a realized tau vector into a plain array of scalars.
function tauValues( Tvec, K ) {
	var a = [];
	var i;
	for ( i = 0; i < K; i++ ) {
		a.push( Tvec.read( i ) );
	}
	return a;
}
