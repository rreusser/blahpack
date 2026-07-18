/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for zunmql, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ormql` (BLOCKED apply-Q, NB=32) ->
* overwrite the M-by-N matrix C with op(Q)*C (side='left') or C*op(Q)
* (side='right'), where Q = H(k)...H(2)H(1) is the unitary factor of a QL
* factorization (reflectors + TAU as returned by ZGEQLF), and op(Q) is Q
* (trans='no-transpose') or Qᴴ (trans='transpose').
*
* Oracle (INDEPENDENT cross-validation, recorded as 'reconstruct' at L2): form
* the EXPLICIT unitary Q from the SAME reflectors via `zungql` (a separately
* validated routine), then compute op(Q)*C0 / C0*op(Q) with the harness's naive
* `ref.matmul` and compare to zunmql's in-place output. Because zungql forms Q by
* an independent code path, a systematic reflector/side/trans error in zunmql
* would disagree with the oracle.
*
* QL storage (zgeqlf on an R×K panel, R>=K, k=K): reflector i is in column i with
* pivot row p = R-K+i, essential v ABOVE the pivot (implicit 1 at the pivot). The
* full square R×R Q is formed by zungql(R,R,K), which expects reflector i in
* column R-K+i (last K columns) with pivot row R-K+i — SAME pivot — so the panel's
* column i is copied into the R×R matrix's column R-K+i.
*
* zunmql is BLOCKED (dlarft + dlarfb) whenever K > NB, falling back to the
* unblocked zunm2l for K <= NB. Its inner kernel is the optimized dgemm/dtrsm,
* which selects its summation form by comparing operand strides: therefore
* bit-exact layout invariance holds only WITHIN a storage-order family (col vs
* row), and cross-order correctness is certified by the property swept over ALL
* layouts. Step 4c additionally probes the advertised WORK minimum on the BLOCKED
* path with a poisoned buffer (the real `dormql` sibling had its
* blocked guard wrong; zunmql was already correct — see test/harness/LEARNINGS.md).
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zunmql from './../lib/ndarray.js';
import zgeqlf from '../../zgeqlf/lib/ndarray.js';
import zungql from '../../zungql/lib/ndarray.js';

var sc = S.complex; // z-routine
var NAME = 'zunmql';
var TRANS_T = 'conjugate-transpose'; // op(Q) = Qᴴ for a complex routine
var TCODE_T = 'c'; // matmul transpose code matching TRANS_T
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32;

// (M,N,K) triples with K <= min(M,N) (valid for BOTH side='left' [Q is M×M from
// an M×K panel] and side='right' [Q is N×N from an N×K panel]). Small/medium +
// zero/trivial corners + LARGE with K>NB=32 so the BLOCKED dlarft/dlarfb path is
// genuinely exercised (K in {35,40}).
var TRIPLES = [
	[ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 2, 2 ], [ 2, 3, 1 ], [ 4, 4, 2 ],
	[ 5, 4, 3 ], [ 3, 5, 3 ], [ 7, 7, 4 ], [ 8, 5, 5 ], [ 5, 8, 4 ],
	[ 15, 10, 7 ], [ 16, 16, 8 ], [ 17, 12, 10 ], [ 31, 20, 15 ],
	[ 33, 33, 17 ], [ 17, 33, 16 ], [ 40, 40, 35 ], [ 48, 40, 40 ],
	[ 40, 48, 35 ], [ 64, 50, 40 ], [ 50, 64, 40 ],
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

// WORK the geqlf ndarray needs for an R×K panel (R>=K, k=K): blocked when K>NB.
function geqlfWork( K ) {
	return ( K > NB ) ? ( ( K * NB ) + ( NB * NB ) ) : Math.max( 1, K );
}

// Generous WORK superset for the orm apply: unblocked needs nw; blocked
// additionally stores the block reflector T and needs nw*NB + (NB+1)*NB.
// nw = N (left) or M (right).
function ormWork( side, M, N ) {
	var nw = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	return ( nw * NB ) + ( ( NB + 1 ) * NB );
}

// Form the EXPLICIT R×R unitary Q from the K reflectors packed in the
// geqlf-factored panel `Ard` (R×K) + tau vector `Tvec`, via the independent
// zungql. QL storage: reflector i (panel column i) maps to R×R column R-K+i.
function formQ( Ard, Tvec, R, K ) {
	var Qlog = new LogicalMatrix( sc, R, R );
	var Qr;
	var Wr;
	var pc;
	var i;
	var j;
	for ( j = 0; j < R; j++ ) {
		pc = j - ( R - K ); // panel column feeding R×R column j (last K columns)
		for ( i = 0; i < R; i++ ) {
			Qlog.set( i, j, ( pc >= 0 ) ? Ard.read( i, pc ) : sc.zero );
		}
	}
	Qr = schemes.dense.realize( sc, Qlog, { 'part': 'full' }, null );
	Wr = poisonedWork( sc, ( K > NB ) ? ( R * NB ) : R );
	zungql( R, R, K, Qr.data, Qr.args[ 0 ], Qr.args[ 1 ], Qr.args[ 2 ], Tvec.data, Tvec.args[ 0 ], Tvec.args[ 1 ], Wr, 1, 0 );
	return readFull( Qr, R, R );
}

function seedFor( M, N, K, side ) {
	return ( 0x100 + ( M * 1000 ) + ( N * 10 ) + K + ( side === 'left' ? 0 : 7 ) ) >>> 0;
}

// Drive one property case: factor an R×K panel, apply op(Q) to C0 with zunmql,
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
	var expected;
	var Q;
	if ( active ) {
		zgeqlf( R, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, geqlfWork( K ) ), 1, 0 );
	}
	C0 = logical.general( sc, rng, M, N );
	Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );

	zunmql( side, trans, M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, ormWork( side, M, N ) ), 1, 0 );

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
	var a = [];
	var i;
	for ( i = 0; i < K; i++ ) {
		a.push( Tvec.read( i ) );
	}
	return a;
}


// TESTS //

// Step 2/5: PROPERTY. op(Q) applied by zunmql == explicit-Q oracle, swept over
// side × trans × (M,N,K) × dense layouts (all layouts for small/medium dims,
// tight only for large).
test( 'zunmql: op(Q)·C matches explicit-Q oracle (side × trans × dims × layouts)', function t() {
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


// Step 3: LAYOUT INVARIANCE. Freeze the reflectors + tau + C0, then re-realize A
// and C per layout and run ONLY zunmql; assert bit-exact output WITHIN a
// storage-order family (col / row). The optimized dgemm inside dlarfb reorders
// across the col<->row flip, so cross-family equality is NOT expected (covered by
// the property above).
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
var VEC_LAYOUTS = schemes.vectorLayouts();

test( 'zunmql: bit-exact within storage-order family (col / row)', function t() {
	var M = 48;
	var N = 40;
	var K = 40; // BLOCKED (K > NB=32) -> dlarft/dlarfb reached
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
			var R = ( side === 'left' ) ? M : N;
			var rng = new RNG( seedFor( M, N, K, side ) );
			var panel = logical.general( sc, rng, R, K );
			var A0 = schemes.dense.realize( sc, panel, { 'part': 'full' }, null );
			var tau0 = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
			var Alog;
			var C0;
			zgeqlf( R, K, A0.data, A0.args[ 0 ], A0.args[ 1 ], A0.args[ 2 ], tau0.data, tau0.args[ 0 ], tau0.args[ 1 ], poisonedWork( sc, geqlfWork( K ) ), 1, 0 );
			Alog = readFull( A0, R, K ); // frozen reflectors (R×K)
			C0 = logical.general( sc, rng, M, N ); // frozen C0

			[ [ colLayouts, 'col' ], [ rowLayouts, 'row' ] ].forEach( function eachFam( fam ) {
				checked( NAME, 'layout-invariance', function run() {
					layoutInvariant( fam[ 0 ], function build( layout, i ) {
						var Ar = schemes.dense.realize( sc, Alog, { 'part': 'full' }, layout );
						var Tr = schemes.realizeVector( sc, tauValues( tau0, K ), VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
						var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
						zunmql( side, tc[ 0 ], M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, ormWork( side, M, N ) ), 1, 0 );
						return check.flattenLogical( sc, readFull( Cr, M, N ) );
					}, { 'label': NAME + ' side=' + side + ' trans=' + tc[ 0 ] + ' ' + fam[ 1 ] + '-major invariance' } );
				} );
			} );
		} );
	} );
} );


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). The blocked
// path (K>NB) stores the block reflector T in a SEPARATE trailing WORK segment,
// so the real consumption is nw*NB + (NB+1)*NB (nw = N for left, M for right) —
// far more than the unblocked nw. (The real `dormql` sibling had this guard wrong,
// advertising only the unblocked `max(1,N)`/`max(1,M)`; zunmql already carried the
// correct blocked guard. See LEARNINGS.md.) Derive the advertised minimum from the wrapper's own throw
// boundary, then run at exactly that length with a POISONED WORK on the BLOCKED
// path and require finite output (no NaN leak from reading past WORK) AND that the
// op(Q) apply still matches the explicit-Q oracle. Cover both sides.
test( 'zunmql: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	[ [ 'left', 80, 50, 40 ], [ 'right', 50, 80, 40 ] ].forEach( function eachCase( cfg ) {
		var side = cfg[ 0 ];
		var M = cfg[ 1 ];
		var N = cfg[ 2 ];
		var K = cfg[ 3 ]; // K > NB -> blocked
		var R = ( side === 'left' ) ? M : N;
		var trans = 'no-transpose';
		var label = NAME + ' WORK-min side=' + side + ' M=' + M + ' N=' + N + ' K=' + K;

		if ( K <= NB ) {
			throw new Error( label + ': case is not on the blocked path (K<=NB); pick larger K' );
		}

		// Build the frozen reflectors + tau + C0 once (deterministic).
		function setup() {
			var rng = new RNG( seedFor( M, N, K, side ) );
			var panel = logical.general( sc, rng, R, K );
			var Ar = schemes.dense.realize( sc, panel, { 'part': 'full' }, null );
			var Tr = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
			var C0;
			zgeqlf( R, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, geqlfWork( K ) ), 1, 0 );
			C0 = logical.general( sc, rng, M, N );
			return { 'Ar': Ar, 'Tr': Tr, 'C0': C0 };
		}

		// `run(len)`: apply op(Q) with a poisoned WORK of `len`, return flat C
		// components. MUST throw the wrapper's RangeError when WORK is too small.
		function run( len ) {
			var s = setup();
			var Cr = schemes.dense.realize( sc, s.C0, { 'part': 'full' }, null );
			zunmql( side, trans, M, N, K, s.Ar.data, s.Ar.args[ 0 ], s.Ar.args[ 1 ], s.Ar.args[ 2 ], s.Tr.data, s.Tr.args[ 0 ], s.Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, len ), 1, 0 );
			return check.flattenLogical( sc, readFull( Cr, M, N ) );
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );

		// And the apply must still match the oracle at exactly that minimum.
		var s = setup();
		var Cr = schemes.dense.realize( sc, s.C0, { 'part': 'full' }, null );
		zunmql( side, trans, M, N, K, s.Ar.data, s.Ar.args[ 0 ], s.Ar.args[ 1 ], s.Ar.args[ 2 ], s.Tr.data, s.Tr.args[ 0 ], s.Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, minLen ), 1, 0 );
		var Q = formQ( s.Ar, s.Tr, R, K );
		var expected = ( side === 'left' ) ? ref.matmul( sc, Q, s.C0, {} ) : ref.matmul( sc, s.C0, Q, {} );
		check.assertReconstruct( sc, readFull( Cr, M, N ), expected, { 'factor': 100, 'label': label + ' (WORK=' + minLen + ')' } );
	} );
} );
