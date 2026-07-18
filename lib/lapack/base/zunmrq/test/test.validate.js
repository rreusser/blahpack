/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for zunmrq, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `unmrq` (BLOCKED apply-Q, NB=32)
* -> overwrite the M-by-N matrix C with op(Q)*C (side='left') or C*op(Q)
* (side='right'), where Q = H(1)ᴴ H(2)ᴴ ... H(K)ᴴ is the unitary factor of an RQ
* factorization (reflectors + TAU as returned by ZGERQF), and op(Q) is Q
* (trans='no-transpose') or Qᴴ (trans='conjugate-transpose').
*
* RQ reflector convention (from zgerq2/zgerqf): the K reflectors come from an RQ
* factorization of a K-by-NQ panel (NQ = M for side='left', N for side='right'),
* stored ROW-wise — reflector i (0-based) lives in row i of the K-by-NQ panel,
* essential part in columns 0..NQ-K+i-1, implicit 1 at column NQ-K+i. The full
* order-NQ unitary Q is what zunmrq applies.
*
* Oracle (INDEPENDENT cross-validation, recorded as 'reconstruct' at L2): form
* the EXPLICIT order-NQ unitary Q from the SAME reflectors via `zungrq` (a
* separately validated routine, independent code path). zungrq expects the K
* reflectors in the LAST K rows of an NQ-by-NQ matrix — exactly the K-by-NQ
* zgerqf panel dropped into the bottom K rows — and reflector i then sits at row
* NQ-K+i with the SAME implicit-1 column NQ-K+i. Compute op(Q)*C0 / C0*op(Q) with
* the harness's naive `ref.matmul` and compare to zunmrq's in-place output.
*
* zunmrq is BLOCKED (zlarft + zlarfb) whenever K > NB=32, falling back to the
* unblocked zunmr2 for K <= NB. Its inner kernel is the optimized zgemm/zgemv,
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
import zunmrq from './../lib/ndarray.js';
import zgerqf from '../../zgerqf/lib/ndarray.js';
import zungrq from '../../zungrq/lib/ndarray.js';

const sc = S.complex; // z-routine
const NAME = 'zunmrq';
const TRANS_T = 'conjugate-transpose'; // op(Q) = Qᴴ for a complex routine
const TCODE_T = 'c'; // matmul transpose code matching TRANS_T
const LogicalMatrix = logical.LogicalMatrix;
const NB = 32;

// (M,N,K) triples with K <= min(M,N) (valid for BOTH sides). Small/medium +
// zero/trivial corners + LARGE (K>NB=32) to reach the blocked zlarft/zlarfb path.
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

// WORK the gerqf ndarray needs for a K×NQ panel (rows=K): blocked when K>NB.
function gerqfWork( K ) {
	return ( K > NB ) ? ( ( K * NB ) + ( NB * NB ) ) : Math.max( 1, K );
}

// Generous WORK superset for the unm apply on the BLOCKED path:
// nw*NB + (NB+1)*NB, nw = N (left) or M (right).
function unmWork( side, M, N ) {
	const nw = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	return ( nw * NB ) + ( ( NB + 1 ) * NB );
}

// Form the EXPLICIT NQ×NQ unitary Q = H(1)ᴴ...H(K)ᴴ from the K reflectors packed
// in the gerqf-factored K×NQ panel `panelArd` + tau vector `Tvec`, via the
// independent zungrq. The panel drops into the bottom K rows of an NQ×NQ matrix
// (reflector i -> row NQ-K+i), the layout zungrq expects; it overwrites the top
// rows and the R region itself. Returns Q as a LogicalMatrix.
function formQ( panelArd, Tvec, nq, K ) {
	const Glog = new LogicalMatrix( sc, nq, nq );
	let grow, pi, j;
	for ( pi = 0; pi < K; pi++ ) {
		grow = nq - K + pi;
		for ( j = 0; j < nq; j++ ) {
			Glog.set( grow, j, panelArd.read( pi, j ) );
		}
	}
	// Top NQ-K rows stay zero (zungrq re-initializes them to identity rows).
	const Gr = schemes.dense.realize( sc, Glog, { 'part': 'full' }, null );
	const Wr = poisonedWork( sc, Math.max( 1, nq * NB ) ); // generous (blocked zungrq path)
	zungrq( nq, nq, K, Gr.data, Gr.args[ 0 ], Gr.args[ 1 ], Gr.args[ 2 ], Tvec.data, Tvec.args[ 0 ], Tvec.args[ 1 ], Wr, 1, 0 );
	return readFull( Gr, nq, nq );
}

function seedFor( M, N, K, side ) {
	return ( 0x300 + ( M * 1000 ) + ( N * 10 ) + K + ( side === 'left' ? 0 : 7 ) ) >>> 0;
}

// Drive one property case: factor a K×NQ panel, apply op(Q) to C0 with zunmrq,
// and compare to the explicit-Q oracle. Returns { got, expected, label }.
function runCase( M, N, K, side, trans, tcode, layout ) {
	const nq = ( side === 'left' ) ? M : N;
	const rng = new RNG( seedFor( M, N, K, side ) );
	const active = ( M > 0 && N > 0 && K > 0 );
	const panel = logical.general( sc, rng, K, nq );
	const Ar = schemes.dense.realize( sc, panel, { 'part': 'full' }, layout );
	const Tr = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
	let expected, Q;
	if ( active ) {
		zgerqf( K, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, gerqfWork( K ) ), 1, 0 );
	}
	const C0 = logical.general( sc, rng, M, N );
	const Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
	const Wo = poisonedWork( sc, unmWork( side, M, N ) );

	zunmrq( side, trans, M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );

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


// Step 2/5: PROPERTY. op(Q) applied by zunmrq == explicit-Q oracle, swept over
// side × trans × (M,N,K) × dense layouts (all layouts for small/medium dims,
// tight only for large).
test( 'zunmrq: op(Q)·C matches explicit-Q oracle (side × trans × dims × layouts)', function t() {
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
// and C per layout and run ONLY zunmrq; assert bit-exact output WITHIN a
// storage-order family (col / row). The optimized zgemm/zgemv inside zlarfb
// reorders across the col<->row flip, so cross-family equality is NOT expected
// (covered by the property above).
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
const VEC_LAYOUTS = schemes.vectorLayouts();

// Read tau values out of a realized tau vector into a plain array of scalars.
function tauValues( Tvec, K ) {
	const a = [];
	let i;
	for ( i = 0; i < K; i++ ) {
		a.push( Tvec.read( i ) );
	}
	return a;
}

test( 'zunmrq: bit-exact within storage-order family (col / row)', function t() {
	const M = 48;
	const N = 40;
	const K = 40; // BLOCKED (K > NB=32) -> zlarft/zlarfb reached
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
			const nq = ( side === 'left' ) ? M : N;
			const rng = new RNG( seedFor( M, N, K, side ) );
			const panel = logical.general( sc, rng, K, nq );
			const A0 = schemes.dense.realize( sc, panel, { 'part': 'full' }, null );
			const tau0 = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
			let Alog, C0;
			zgerqf( K, nq, A0.data, A0.args[ 0 ], A0.args[ 1 ], A0.args[ 2 ], tau0.data, tau0.args[ 0 ], tau0.args[ 1 ], poisonedWork( sc, gerqfWork( K ) ), 1, 0 );
			Alog = readFull( A0, K, nq ); // frozen reflectors (K×NQ)
			C0 = logical.general( sc, rng, M, N ); // frozen C0

			[ [ colLayouts, 'col' ], [ rowLayouts, 'row' ] ].forEach( function eachFam( fam ) {
				checked( NAME, 'layout-invariance', function run() {
					layoutInvariant( fam[ 0 ], function build( layout, i ) {
						const Ar = schemes.dense.realize( sc, Alog, { 'part': 'full' }, layout );
						const Tr = schemes.realizeVector( sc, tauValues( tau0, K ), VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
						const Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
						const Wo = poisonedWork( sc, unmWork( side, M, N ) );
						zunmrq( side, tc[ 0 ], M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
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
// nw*NB + (NB+1)*NB (nw = N for left, M for right). Derive the advertised minimum
// from the wrapper's own throw boundary, then run at exactly that length with a
// POISONED WORK on the BLOCKED path and require finite output AND that the op(Q)
// apply still matches the explicit-Q oracle. Cover both sides.
test( 'zunmrq: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	[ [ 'left', 80, 50, 40 ], [ 'right', 50, 80, 40 ] ].forEach( function eachCase( cfg ) {
		const side = cfg[ 0 ];
		const M = cfg[ 1 ];
		const N = cfg[ 2 ];
		const K = cfg[ 3 ]; // K > NB -> blocked
		const nq = ( side === 'left' ) ? M : N;
		const trans = 'no-transpose';
		const label = NAME + ' WORK-min side=' + side + ' M=' + M + ' N=' + N + ' K=' + K;

		// Build the frozen reflectors + tau + C0 once (deterministic).
		function setup() {
			const rng = new RNG( seedFor( M, N, K, side ) );
			const panel = logical.general( sc, rng, K, nq );
			const Ar = schemes.dense.realize( sc, panel, { 'part': 'full' }, null );
			const Tr = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
			zgerqf( K, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, gerqfWork( K ) ), 1, 0 );
			const C0 = logical.general( sc, rng, M, N );
			return { 'Ar': Ar, 'Tr': Tr, 'C0': C0 };
		}

		function run( len ) {
			const s = setup();
			const Cr = schemes.dense.realize( sc, s.C0, { 'part': 'full' }, null );
			const Wo = poisonedWork( sc, len );
			zunmrq( side, trans, M, N, K, s.Ar.data, s.Ar.args[ 0 ], s.Ar.args[ 1 ], s.Ar.args[ 2 ], s.Tr.data, s.Tr.args[ 0 ], s.Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
			return check.flattenLogical( sc, readFull( Cr, M, N ) );
		}

		const minLen = assertWorkspaceSufficient( run, {}, label );

		if ( K <= NB ) {
			throw new Error( label + ': case is not on the blocked path (K<=NB); pick larger K' );
		}

		const s = setup();
		const Cr = schemes.dense.realize( sc, s.C0, { 'part': 'full' }, null );
		zunmrq( side, trans, M, N, K, s.Ar.data, s.Ar.args[ 0 ], s.Ar.args[ 1 ], s.Ar.args[ 2 ], s.Tr.data, s.Tr.args[ 0 ], s.Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, minLen ), 1, 0 );
		const Q = formQ( s.Ar, s.Tr, nq, K );
		const expected = ( side === 'left' ) ? ref.matmul( sc, Q, s.C0, {} ) : ref.matmul( sc, s.C0, Q, {} );
		check.assertReconstruct( sc, readFull( Cr, M, N ), expected, { 'factor': 100, 'label': label + ' (WORK=' + minLen + ')' } );
	} );
} );
