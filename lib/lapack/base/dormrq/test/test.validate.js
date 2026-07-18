/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dormrq, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ormrq` (BLOCKED apply-Q, NB=32) ->
* overwrite the M-by-N matrix C with op(Q)*C (side='left') or C*op(Q)
* (side='right'), where Q = H(1) H(2) ... H(K) is the orthogonal factor of an RQ
* factorization (reflectors + TAU as returned by DGERQF), and op(Q) is Q
* (trans='no-transpose') or Qᵀ (trans='transpose').
*
* RQ reflector convention (from dgerq2/dgerqf): the K reflectors come from an RQ
* factorization of a K-by-NQ panel (NQ = M for side='left', N for side='right'),
* stored ROW-wise — reflector i (0-based) lives in row i of the K-by-NQ panel,
* essential part in columns 0..NQ-K+i-1, implicit 1 at column NQ-K+i. The full
* order-NQ orthogonal Q = H(1)...H(K) is what dormrq applies.
*
* Oracle (INDEPENDENT cross-validation, recorded as 'reconstruct' at L2): form
* the EXPLICIT order-NQ orthogonal Q from the SAME reflectors via `dorgrq` (a
* separately validated routine, independent code path). dorgrq expects the K
* reflectors in the LAST K rows of an NQ-by-NQ matrix — which is exactly the
* K-by-NQ dgerqf panel dropped into the bottom K rows — and reflector i then sits
* at row NQ-K+i with the SAME implicit-1 column NQ-K+i, so the embedding is a
* direct row placement. Compute op(Q)*C0 / C0*op(Q) with the harness's naive
* `ref.matmul` and compare to dormrq's in-place output; a systematic
* reflector/side/trans error in dormrq would disagree with the oracle.
*
* dormrq is BLOCKED (dlarft + dlarfb) whenever K > NB=32, falling back to the
* unblocked dormr2 for K <= NB. Its inner kernel is the optimized dgemm/dgemv,
* which selects its summation form by comparing operand strides: therefore
* bit-exact layout invariance holds only WITHIN a storage-order family (col vs
* row), and cross-order correctness is certified by the property swept over ALL
* layouts. Step 4c additionally probes the advertised WORK minimum on the BLOCKED
* path with a poisoned buffer.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dormrq from './../lib/ndarray.js';
import dgerqf from '../../dgerqf/lib/ndarray.js';
import dorgrq from '../../dorgrq/lib/ndarray.js';

var sc = S.real; // d-routine
var NAME = 'dormrq';
var TRANS_T = 'transpose'; // op(Q) = Qᵀ for a real routine
var TCODE_T = 't'; // matmul transpose code matching TRANS_T
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32;

// (M,N,K) triples with K <= min(M,N) (valid for BOTH side='left' [panel K×M, Q is
// M×M] and side='right' [panel K×N, Q is N×N]). Small/medium + zero/trivial
// corners + LARGE (K>NB=32) to reach the blocked dlarft/dlarfb path.
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

// WORK the gerqf ndarray needs for a K×NQ panel (rows=K): blocked when K>NB.
function gerqfWork( K ) {
	return ( K > NB ) ? ( ( K * NB ) + ( NB * NB ) ) : Math.max( 1, K );
}

// Generous WORK superset for the orm apply on the BLOCKED path:
// nw*NB + (NB+1)*NB, nw = N (left) or M (right).
function ormWork( side, M, N ) {
	var nw = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	return ( nw * NB ) + ( ( NB + 1 ) * NB );
}

// Form the EXPLICIT NQ×NQ orthogonal Q = H(1)...H(K) from the K reflectors packed
// in the gerqf-factored K×NQ panel `panelArd` + tau vector `Tvec`, via the
// independent dorgrq. The panel drops into the bottom K rows of an NQ×NQ matrix
// (reflector i -> row NQ-K+i), the layout dorgrq expects; it overwrites the top
// rows and the R region itself. Returns Q as a LogicalMatrix.
function formQ( panelArd, Tvec, nq, K ) {
	var Glog = new LogicalMatrix( sc, nq, nq );
	var Gr;
	var Wr;
	var grow;
	var pi;
	var j;
	for ( pi = 0; pi < K; pi++ ) {
		grow = nq - K + pi;
		for ( j = 0; j < nq; j++ ) {
			Glog.set( grow, j, panelArd.read( pi, j ) );
		}
	}
	// Top NQ-K rows stay zero (dorgrq re-initializes them to identity rows).
	Gr = schemes.dense.realize( sc, Glog, { 'part': 'full' }, null );
	Wr = poisonedWork( sc, Math.max( 1, nq * NB ) ); // generous (blocked dorgrq path)
	dorgrq( nq, nq, K, Gr.data, Gr.args[ 0 ], Gr.args[ 1 ], Gr.args[ 2 ], Tvec.data, Tvec.args[ 0 ], Tvec.args[ 1 ], Wr, 1, 0 );
	return readFull( Gr, nq, nq );
}

function seedFor( M, N, K, side ) {
	return ( 0x200 + ( M * 1000 ) + ( N * 10 ) + K + ( side === 'left' ? 0 : 7 ) ) >>> 0;
}

// Drive one property case: factor a K×NQ panel, apply op(Q) to C0 with dormrq,
// and compare to the explicit-Q oracle. Returns { got, expected, label }.
function runCase( M, N, K, side, trans, tcode, layout ) {
	var nq = ( side === 'left' ) ? M : N;
	var rng = new RNG( seedFor( M, N, K, side ) );
	var active = ( M > 0 && N > 0 && K > 0 );
	var panel = logical.general( sc, rng, K, nq );
	var Ar = schemes.dense.realize( sc, panel, { 'part': 'full' }, layout );
	var Tr = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
	var C0;
	var Cr;
	var Wo;
	var expected;
	var Q;
	if ( active ) {
		dgerqf( K, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, gerqfWork( K ) ), 1, 0 );
	}
	C0 = logical.general( sc, rng, M, N );
	Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
	Wo = poisonedWork( sc, ormWork( side, M, N ) );

	dormrq( side, trans, M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );

	if ( active ) {
		Q = formQ( Ar, Tr, nq, K );
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


// Step 2/5: PROPERTY. op(Q) applied by dormrq == explicit-Q oracle, swept over
// side × trans × (M,N,K) × dense layouts (all layouts for small/medium dims,
// tight only for large).
test( 'dormrq: op(Q)·C matches explicit-Q oracle (side × trans × dims × layouts)', function t() {
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
// dormrq; assert bit-exact output WITHIN a storage-order family (col / row). The
// optimized dgemm/dgemv inside dlarfb reorders across the col<->row flip, so
// cross-family equality is NOT expected (and is covered by the property above).
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
var VEC_LAYOUTS = schemes.vectorLayouts();

// Read tau values out of a realized tau vector into a plain array of scalars.
function tauValues( Tvec, K ) {
	var a = [];
	var i;
	for ( i = 0; i < K; i++ ) {
		a.push( Tvec.read( i ) );
	}
	return a;
}

test( 'dormrq: bit-exact within storage-order family (col / row)', function t() {
	var M = 48;
	var N = 40;
	var K = 40; // BLOCKED (K > NB=32) -> dlarft/dlarfb reached
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
			var nq = ( side === 'left' ) ? M : N;
			var rng = new RNG( seedFor( M, N, K, side ) );
			var panel = logical.general( sc, rng, K, nq );
			var A0 = schemes.dense.realize( sc, panel, { 'part': 'full' }, null );
			var tau0 = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
			var Alog;
			var C0;
			dgerqf( K, nq, A0.data, A0.args[ 0 ], A0.args[ 1 ], A0.args[ 2 ], tau0.data, tau0.args[ 0 ], tau0.args[ 1 ], poisonedWork( sc, gerqfWork( K ) ), 1, 0 );
			Alog = readFull( A0, K, nq ); // frozen reflectors (K×NQ)
			C0 = logical.general( sc, rng, M, N ); // frozen C0

			[ [ colLayouts, 'col' ], [ rowLayouts, 'row' ] ].forEach( function eachFam( fam ) {
				checked( NAME, 'layout-invariance', function run() {
					layoutInvariant( fam[ 0 ], function build( layout, i ) {
						var Ar = schemes.dense.realize( sc, Alog, { 'part': 'full' }, layout );
						var Tr = schemes.realizeVector( sc, tauValues( tau0, K ), VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
						var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
						var Wo = poisonedWork( sc, ormWork( side, M, N ) );
						dormrq( side, tc[ 0 ], M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
						return check.flattenLogical( sc, readFull( Cr, M, N ) );
					}, { 'label': NAME + ' side=' + side + ' trans=' + tc[ 0 ] + ' ' + fam[ 1 ] + '-major invariance' } );
				} );
			} );
		} );
	} );
} );


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). The blocked
// path (K>NB) stores the block reflector T in a SEPARATE trailing WORK segment
// (offsetT = offsetWork + ldwork*NB), so the real consumption is
// nw*NB + (NB+1)*NB (nw = N for left, M for right) — far more than the unblocked
// nw. Derive the advertised minimum from the wrapper's own throw boundary, then
// run at exactly that length with a POISONED WORK on the BLOCKED path and require
// finite output (no NaN leak from reading past WORK) AND that the op(Q) apply
// still matches the explicit-Q oracle. Cover both sides.
test( 'dormrq: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	[ [ 'left', 80, 50, 40 ], [ 'right', 50, 80, 40 ] ].forEach( function eachCase( cfg ) {
		var side = cfg[ 0 ];
		var M = cfg[ 1 ];
		var N = cfg[ 2 ];
		var K = cfg[ 3 ]; // K > NB -> blocked
		var nq = ( side === 'left' ) ? M : N;
		var trans = 'no-transpose';
		var label = NAME + ' WORK-min side=' + side + ' M=' + M + ' N=' + N + ' K=' + K;

		// Build the frozen reflectors + tau + C0 once (deterministic).
		function setup() {
			var rng = new RNG( seedFor( M, N, K, side ) );
			var panel = logical.general( sc, rng, K, nq );
			var Ar = schemes.dense.realize( sc, panel, { 'part': 'full' }, null );
			var Tr = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
			var C0;
			dgerqf( K, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, gerqfWork( K ) ), 1, 0 );
			C0 = logical.general( sc, rng, M, N );
			return { 'Ar': Ar, 'Tr': Tr, 'C0': C0 };
		}

		// `run(len)`: apply op(Q) with a poisoned WORK of `len` (strideWork=1,
		// offsetWork=0), return flat C components. MUST throw the wrapper's
		// RangeError when WORK is too small.
		function run( len ) {
			var s = setup();
			var Cr = schemes.dense.realize( sc, s.C0, { 'part': 'full' }, null );
			var Wo = poisonedWork( sc, len );
			dormrq( side, trans, M, N, K, s.Ar.data, s.Ar.args[ 0 ], s.Ar.args[ 1 ], s.Ar.args[ 2 ], s.Tr.data, s.Tr.args[ 0 ], s.Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
			return check.flattenLogical( sc, readFull( Cr, M, N ) );
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );

		// The blocked path must actually have been taken.
		if ( K <= NB ) {
			throw new Error( label + ': case is not on the blocked path (K<=NB); pick larger K' );
		}

		// And the apply must still match the oracle at exactly that minimum.
		var s = setup();
		var Cr = schemes.dense.realize( sc, s.C0, { 'part': 'full' }, null );
		dormrq( side, trans, M, N, K, s.Ar.data, s.Ar.args[ 0 ], s.Ar.args[ 1 ], s.Ar.args[ 2 ], s.Tr.data, s.Tr.args[ 0 ], s.Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, minLen ), 1, 0 );
		var Q = formQ( s.Ar, s.Tr, nq, K );
		var expected = ( side === 'left' ) ? ref.matmul( sc, Q, s.C0, {} ) : ref.matmul( sc, s.C0, Q, {} );
		check.assertReconstruct( sc, readFull( Cr, M, N ), expected, { 'factor': 100, 'label': label + ' (WORK=' + minLen + ')' } );
	} );
} );
