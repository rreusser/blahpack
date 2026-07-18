/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dormr2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ormr2` (UNBLOCKED apply-Q) ->
* overwrite the M-by-N matrix C with op(Q)*C (side='left') or C*op(Q)
* (side='right'), where Q = H(1) H(2) ... H(K) is the orthogonal factor of an RQ
* factorization (reflectors + TAU as returned by DGERQF), and op(Q) is Q
* (trans='no-transpose') or Qᵀ (trans='transpose'). dormr2 applies each reflector
* one at a time via dlarf (no blocking, no T-factor scratch — WORK is just nw).
*
* RQ reflector convention (from dgerq2/dgerqf): the K reflectors come from an RQ
* factorization of a K-by-NQ panel (NQ = M for side='left', N for side='right'),
* stored ROW-wise — reflector i (0-based) lives in row i of the K-by-NQ panel,
* essential part in columns 0..NQ-K+i-1, implicit 1 at column NQ-K+i.
*
* Oracle (INDEPENDENT cross-validation, recorded as 'reconstruct' at L2): form
* the EXPLICIT order-NQ orthogonal Q from the SAME reflectors via `dorgrq` (an
* independent code path). dorgrq expects the K reflectors in the LAST K rows of an
* NQ-by-NQ matrix — exactly the K-by-NQ dgerqf panel dropped into the bottom K
* rows — so reflector i sits at row NQ-K+i with the SAME implicit-1 column
* NQ-K+i. Compute op(Q)*C0 / C0*op(Q) with the harness's naive `ref.matmul` and
* compare to dormr2's in-place output.
*
* dormr2's inner kernel is the optimized dgemv/dger (dlarf), which selects its
* summation form by operand strides: therefore bit-exact layout invariance holds
* only WITHIN a storage-order family (col vs row); cross-order correctness is
* certified by the property swept over ALL layouts.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dormr2 from './../lib/ndarray.js';
import dgerqf from '../../dgerqf/lib/ndarray.js';
import dorgrq from '../../dorgrq/lib/ndarray.js';

const sc = S.real; // d-routine
const NAME = 'dormr2';
const TRANS_T = 'transpose'; // op(Q) = Qᵀ for a real routine
const TCODE_T = 't'; // matmul transpose code matching TRANS_T
const LogicalMatrix = logical.LogicalMatrix;
const NB = 32;

// (M,N,K) triples with K <= min(M,N) (valid for BOTH sides). dormr2 is unblocked
// so no NB threshold matters; span small/medium + zero corners + a couple large.
const TRIPLES = [
	[ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 2, 2 ], [ 2, 3, 1 ], [ 4, 4, 2 ],
	[ 5, 4, 3 ], [ 3, 5, 3 ], [ 7, 7, 4 ], [ 8, 5, 5 ], [ 5, 8, 4 ],
	[ 15, 10, 7 ], [ 16, 16, 8 ], [ 17, 12, 10 ], [ 31, 20, 15 ],
	[ 33, 33, 17 ], [ 17, 33, 16 ], [ 40, 33, 20 ],
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

// WORK for the unblocked r2 apply: nw = N (left) or M (right).
function ormWork( side, M, N ) {
	return ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
}

// Form the EXPLICIT NQ×NQ orthogonal Q = H(1)...H(K) from the K reflectors packed
// in the gerqf-factored K×NQ panel via the independent dorgrq. The panel drops
// into the bottom K rows of an NQ×NQ matrix (reflector i -> row NQ-K+i).
function formQ( panelArd, Tvec, nq, K ) {
	const Glog = new LogicalMatrix( sc, nq, nq );
	let grow, pi, j;
	for ( pi = 0; pi < K; pi++ ) {
		grow = nq - K + pi;
		for ( j = 0; j < nq; j++ ) {
			Glog.set( grow, j, panelArd.read( pi, j ) );
		}
	}
	const Gr = schemes.dense.realize( sc, Glog, { 'part': 'full' }, null );
	const Wr = poisonedWork( sc, Math.max( 1, nq * NB ) ); // generous
	dorgrq( nq, nq, K, Gr.data, Gr.args[ 0 ], Gr.args[ 1 ], Gr.args[ 2 ], Tvec.data, Tvec.args[ 0 ], Tvec.args[ 1 ], Wr, 1, 0 );
	return readFull( Gr, nq, nq );
}

function seedFor( M, N, K, side ) {
	return ( 0x400 + ( M * 1000 ) + ( N * 10 ) + K + ( side === 'left' ? 0 : 7 ) ) >>> 0;
}

// Drive one property case: factor a K×NQ panel, apply op(Q) to C0 with dormr2,
// and compare to the explicit-Q oracle.
function runCase( M, N, K, side, trans, tcode, layout ) {
	const nq = ( side === 'left' ) ? M : N;
	const rng = new RNG( seedFor( M, N, K, side ) );
	const active = ( M > 0 && N > 0 && K > 0 );
	const panel = logical.general( sc, rng, K, nq );
	const Ar = schemes.dense.realize( sc, panel, { 'part': 'full' }, layout );
	const Tr = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
	let expected, Q;
	if ( active ) {
		dgerqf( K, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, gerqfWork( K ) ), 1, 0 );
	}
	const C0 = logical.general( sc, rng, M, N );
	const Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
	const Wo = poisonedWork( sc, ormWork( side, M, N ) );

	dormr2( side, trans, M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );

	if ( active ) {
		Q = formQ( Ar, Tr, nq, K );
		expected = ( side === 'left' ) ? ref.matmul( sc, Q, C0, { 'transa': tcode } ) : ref.matmul( sc, C0, Q, { 'transb': tcode } );
	} else {
		expected = C0;
	}
	return {
		'got': readFull( Cr, M, N ),
		'expected': expected,
		'label': NAME + ' side=' + side + ' trans=' + trans + ' M=' + M + ' N=' + N + ' K=' + K
	};
}


// Step 2/5: PROPERTY. op(Q) applied by dormr2 == explicit-Q oracle, swept over
// side × trans × (M,N,K) × dense layouts (all layouts for small/medium dims,
// tight only for large).
test( 'dormr2: op(Q)·C matches explicit-Q oracle (side × trans × dims × layouts)', function t() {
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


// Step 3: LAYOUT INVARIANCE. Freeze the reflectors + tau + C0, re-realize per
// layout and run ONLY dormr2; assert bit-exact output WITHIN a storage-order
// family (col / row). The optimized dgemv/dger inside dlarf reorders across the
// col<->row flip, so cross-family equality is NOT expected (covered by property).
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
const VEC_LAYOUTS = schemes.vectorLayouts();

function tauValues( Tvec, K ) {
	const a = [];
	let i;
	for ( i = 0; i < K; i++ ) {
		a.push( Tvec.read( i ) );
	}
	return a;
}

test( 'dormr2: bit-exact within storage-order family (col / row)', function t() {
	const M = 17;
	const N = 15;
	const K = 9;
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ [ 'no-transpose', 'n' ], [ TRANS_T, TCODE_T ] ].forEach( function eachTrans( tc ) {
			const nq = ( side === 'left' ) ? M : N;
			const rng = new RNG( seedFor( M, N, K, side ) );
			const panel = logical.general( sc, rng, K, nq );
			const A0 = schemes.dense.realize( sc, panel, { 'part': 'full' }, null );
			const tau0 = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
			let Alog, C0;
			dgerqf( K, nq, A0.data, A0.args[ 0 ], A0.args[ 1 ], A0.args[ 2 ], tau0.data, tau0.args[ 0 ], tau0.args[ 1 ], poisonedWork( sc, gerqfWork( K ) ), 1, 0 );
			Alog = readFull( A0, K, nq );
			C0 = logical.general( sc, rng, M, N );

			[ [ colLayouts, 'col' ], [ rowLayouts, 'row' ] ].forEach( function eachFam( fam ) {
				checked( NAME, 'layout-invariance', function run() {
					layoutInvariant( fam[ 0 ], function build( layout, i ) {
						const Ar = schemes.dense.realize( sc, Alog, { 'part': 'full' }, layout );
						const Tr = schemes.realizeVector( sc, tauValues( tau0, K ), VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
						const Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
						const Wo = poisonedWork( sc, ormWork( side, M, N ) );
						dormr2( side, tc[ 0 ], M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
						return check.flattenLogical( sc, readFull( Cr, M, N ) );
					}, { 'label': NAME + ' side=' + side + ' trans=' + tc[ 0 ] + ' ' + fam[ 1 ] + '-major invariance' } );
				} );
			} );
		} );
	} );
} );


// Step 4c: WORKSPACE CONFORMANCE. dormr2 is unblocked (dlarf), so it consumes
// exactly nw = N (left) / M (right) WORK elements — no trailing T-factor segment.
// Verify the advertised minimum actually suffices under a poisoned buffer (this
// is the class of bug that afflicts the BLOCKED sibling dormrq; here it must be
// clean because the wrapper guard equals the true unblocked need).
test( 'dormr2: advertised WORK minimum suffices (unblocked, poisoned)', function t() {
	[ [ 'left', 20, 12, 8 ], [ 'right', 12, 20, 8 ] ].forEach( function eachCase( cfg ) {
		const side = cfg[ 0 ];
		const M = cfg[ 1 ];
		const N = cfg[ 2 ];
		const K = cfg[ 3 ];
		const nq = ( side === 'left' ) ? M : N;
		const trans = 'no-transpose';
		const label = NAME + ' WORK-min side=' + side + ' M=' + M + ' N=' + N + ' K=' + K;

		function setup() {
			const rng = new RNG( seedFor( M, N, K, side ) );
			const panel = logical.general( sc, rng, K, nq );
			const Ar = schemes.dense.realize( sc, panel, { 'part': 'full' }, null );
			const Tr = schemes.realizeVector( sc, poison( K ), TIGHT_VEC );
			dgerqf( K, nq, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], poisonedWork( sc, gerqfWork( K ) ), 1, 0 );
			const C0 = logical.general( sc, rng, M, N );
			return { 'Ar': Ar, 'Tr': Tr, 'C0': C0 };
		}

		function run( len ) {
			const s = setup();
			const Cr = schemes.dense.realize( sc, s.C0, { 'part': 'full' }, null );
			const Wo = poisonedWork( sc, len );
			dormr2( side, trans, M, N, K, s.Ar.data, s.Ar.args[ 0 ], s.Ar.args[ 1 ], s.Ar.args[ 2 ], s.Tr.data, s.Tr.args[ 0 ], s.Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wo, 1, 0 );
			return check.flattenLogical( sc, readFull( Cr, M, N ) );
		}

		const minLen = assertWorkspaceSufficient( run, {}, label );

		const s = setup();
		const Cr = schemes.dense.realize( sc, s.C0, { 'part': 'full' }, null );
		dormr2( side, trans, M, N, K, s.Ar.data, s.Ar.args[ 0 ], s.Ar.args[ 1 ], s.Ar.args[ 2 ], s.Tr.data, s.Tr.args[ 0 ], s.Tr.args[ 1 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], poisonedWork( sc, minLen ), 1, 0 );
		const Q = formQ( s.Ar, s.Tr, nq, K );
		const expected = ( side === 'left' ) ? ref.matmul( sc, Q, s.C0, {} ) : ref.matmul( sc, s.C0, Q, {} );
		check.assertReconstruct( sc, readFull( Cr, M, N ), expected, { 'factor': 100, 'label': label + ' (WORK=' + minLen + ')' } );
	} );
} );
