/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dorglq, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `orglq` FORMS the M-by-N orthogonal
* factor Q (orthonormal ROWS) from the elementary reflectors an LQ factorization
* (dgelqf) leaves in the first K rows of A. This is the BLOCKED former: it batches
* the reflectors through dlarft/dlarfb (an optimized dgemm) and falls back to the
* unblocked dorgl2 for the trailing panel, producing EXACTLY the same Q. It
* CONSUMES a factorization, so it is validated as the second half of the
* composition dgelqf -> dorglq:
*
*   - factor a random general M-by-N A0 (M <= N) with dgelqf; on exit A holds the
*     M-by-M lower-triangular L (on/below the diagonal, cols 0..M-1; cols M..N-1
*     of the trapezoid are structurally zero) and, above the diagonal, the
*     essential Householder rows;
*   - SNAPSHOT L before forming Q;
*   - dorglq overwrites A's M rows with Q (M-by-N);
*   - PROPERTY (a) orthonormal rows: Q·Qᴴ = I_M  (asserted as unitarity of Qᴴ),
*     and (b) reconstruction: A0 = L·Q.
*
* Both are EXACT algebraic identities for any general A, so plain random A
* suffices. The block size is hardcoded NB = 32, so the blocked dlarft/dlarfb path
* is taken whenever K = M > 32; the (M,N) sweep straddles that threshold
* (…,31,32,33,48,63,64,65,100 squares, plus wide M>32 rectangles).
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, ref, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dgelqf from './../../dgelqf/lib/ndarray.js';
import dorglq from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;
const ROUTINE = 'dorglq';
const NB = 32; // hardcoded block size in lib/base.js
const TIGHT = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// Generous WORK for the (blocked) dgelqf factor.
function gelqfWork( M ) {
	return Math.max( 1, ( M * NB ) + ( NB * NB ) );
}

// WORK the blocked dorglq consumes: dlarft stores its ib-by-ib T factor with
// leading dimension LDWORK = M, and dlarfb reuses the same buffer at offset ib,
// so the blocked path needs M*NB scratch (matching reference DORGLQ's
// IWS = LDWORK*NB); the unblocked fallback (K <= NB) needs only M.
function orgWork( M ) {
	return Math.max( 1, M * NB );
}

// (M,N) sweep with M <= N: squares straddling the NB=32 block threshold (from
// SIZES, incl. the LARGE 48/63/64/65/100 that exercise dlarft/dlarfb) + wide
// (M < N) rectangles crossing the threshold + zero corners.
const PAIRS = [];
SIZES.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 1, 5 ], [ 3, 7 ], [ 5, 8 ], [ 8, 16 ], [ 16, 33 ], [ 33, 48 ], [ 40, 65 ], [ 48, 64 ], [ 33, 100 ], [ 64, 100 ], [ 65, 100 ], [ 0, 4 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

// Read the M-by-M lower-triangular factor L (on/below diagonal; zero above).
function readL( R, M ) {
	const L = new LogicalMatrix( sc, M, M );
	let i, j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < M; i++ ) {
			L.set( i, j, ( i >= j ) ? R.read( i, j ) : sc.zero );
		}
	}
	return L;
}

// Read the full M-by-N matrix currently in storage.
function readFull( R, M, N ) {
	const F = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

// Conjugate transpose: T (N x M) with T(j,i) = conj(Q(i,j)); columns of T are the
// rows of Q, so assertOrthonormal(T) checks T^H T = Q Q^H = I_M.
function conjT( Q ) {
	const T = new LogicalMatrix( sc, Q.cols, Q.rows );
	let i, j;
	for ( i = 0; i < Q.rows; i++ ) {
		for ( j = 0; j < Q.cols; j++ ) {
			T.set( j, i, sc.conj( Q.get( i, j ) ) );
		}
	}
	return T;
}

// Factor A0 with dgelqf at `layout`, snapshot L, then form Q in place with dorglq.
// When `poison`, dorglq's WORK is a poisoned buffer of exactly `owlen` elements.
function factorAndForm( M, N, layout, owlen, poison ) {
	const K = M; // K = min(M,N) = M for M <= N
	const rng = new RNG( 0x100 + ( M * 100 ) + N );
	const A0 = logical.general( sc, rng, M, N );
	const R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	const TAU = schemes.realizeVector( sc, new Array( K ).fill( sc.zero ), TIGHT );
	const GW = schemes.realizeVector( sc, new Array( gelqfWork( M ) ).fill( sc.zero ), TIGHT );
	dgelqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], GW.data, GW.args[ 0 ], GW.args[ 1 ] );

	const L = readL( R, M );

	const OW = ( poison ) ? poisonedWork( sc, owlen ) : schemes.realizeVector( sc, new Array( owlen ).fill( sc.zero ), TIGHT ).data;
	dorglq( M, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], OW, 1, 0 );

	return { 'A0': A0, 'L': L, 'Q': readFull( R, M, N ) };
}


// TESTS //

// Steps 2-3 (L2): orthonormal ROWS of Q AND reconstruction A0 = L*Q across the
// (M,N) sweep (blocked + unblocked) and every dense storage layout. dorglq does
// no pivot search, so all seven layouts are in contract; bit-exactness across the
// col<->row flip is deferred to the layout-invariance test below.
test( 'dorglq: orthonormal rows (Q·Qᴴ=I) and A=L*Q ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		schemes.dense.layouts().forEach( function eachLayout( layout, li ) {
			const f = factorAndForm( M, N, layout, orgWork( M ), false );
			const lbl = ROUTINE + ' M=' + M + ' N=' + N + ' layout=' + li;
			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, conjT( f.Q ), { 'label': lbl + ' Q rows orthonormal' } );
			});
			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, ref.matmul( sc, f.L, f.Q ), f.A0, { 'label': lbl + ' A=L*Q' } );
			});
		});
	});
});

// Step 4 (L3): layout-invariance fuzz on genuinely BLOCKED sizes (K = M > 32, each
// triggering dlarft/dlarfb). FREEZE the dgelqf factorization once, then re-realize
// the fixed reflectors + tau at each org-layout variant and run ONLY dorglq. Within
// a single storage-order family the formed Q must be bit-exact across offset,
// leading-dim padding, and stride SIGN; the col<->row FLIP legitimately reorders
// the optimized dlarfb->dgemm accumulation (~1 ULP), so cross-order agreement is
// certified by the reconstruction property above. TAU is fuzzed over positive-stride
// layouts (honored end-to-end); WORK is fuzzed over UNIT-stride layouts only,
// because base.js passes stride 1 (not strideWork) to dlarft/dlarfb, so a non-unit
// WORK stride is out of contract on the blocked path — offset/lead still varied.
const VLAYOUTS = schemes.vectorLayouts();
const TAULAYOUTS = VLAYOUTS.filter( function pos( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) > 0;
});
const WLAYOUTS = VLAYOUTS.filter( function unit( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) === 1;
});
const colLayouts = schemes.dense.layouts().filter( function isCol( L ) {
	return L.order !== 'row';
});
const rowLayouts = schemes.dense.layouts().filter( function isRow( L ) {
	return L.order === 'row';
});

function freezeFactor( M, N ) {
	const K = M;
	const rng = new RNG( 0xF00D + ( M * 17 ) + N );
	const A0 = logical.general( sc, rng, M, N );
	const R = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	const TAU = schemes.realizeVector( sc, new Array( K ).fill( sc.zero ), TIGHT );
	const GW = schemes.realizeVector( sc, new Array( gelqfWork( M ) ).fill( sc.zero ), TIGHT );
	dgelqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], GW.data, GW.args[ 0 ], GW.args[ 1 ] );
	const taus = [];
	let i;
	for ( i = 0; i < K; i++ ) {
		taus.push( TAU.read( i ) );
	}
	return { 'F': readFull( R, M, N ), 'taus': taus };
}

function runInvariance( variants, fam, M, N, fr ) {
	const K = M;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			const R = schemes.dense.realize( sc, fr.F, { 'part': 'full' }, layout );
			const TAU = schemes.realizeVector( sc, fr.taus, TAULAYOUTS[ i % TAULAYOUTS.length ] );
			const OW = schemes.realizeVector( sc, new Array( orgWork( M ) ).fill( sc.zero ), WLAYOUTS[ i % WLAYOUTS.length ] );
			dorglq( M, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], OW.data, OW.args[ 0 ], OW.args[ 1 ] );
			return check.flattenLogical( sc, readFull( R, M, N ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	});
}

test( 'dorglq: bit-exact Q within storage-order family (col / row), blocked path', function t() {
	[ [ 40, 50 ], [ 48, 64 ], [ 33, 48 ], [ 64, 80 ] ].forEach( function eachSize( sz ) {
		const fr = freezeFactor( sz[ 0 ], sz[ 1 ] );
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ], fr );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ], fr );
	});
});

// Step 4c: workspace conformance on the BLOCKED path. The blocked former hardcodes
// NB and stores its dlarft/dlarfb scratch in WORK with leading dimension M, so it
// consumes M*NB — but the reference-copied LWORK guard only advertises max(1,M).
// Probe the advertised minimum from the wrapper's throw boundary, then run at
// exactly that length with a POISONED buffer and require finite Q + orthonormality
// + reconstruction. A too-small advertised minimum over-reads poisoned padding ->
// NaN, which fails loudly. Uses a square blocked and a wide (M<N) blocked case.
test( 'dorglq: advertised WORK minimum suffices on the blocked path (poisoned)', function t() {
	[ [ 80, 80 ], [ 48, 120 ] ].forEach( function eachCase( c ) {
		const M = c[ 0 ];
		const N = c[ 1 ];
		const label = ROUTINE + ' WORK-sufficiency ' + M + 'x' + N;

		// The blocked path must actually be taken (K = M > NB), else this asserts
		// nothing about the block seam.
		if ( M <= NB ) {
			throw new Error( label + ': not on the blocked path (M<=NB); pick larger M' );
		}

		const min = assertWorkspaceSufficient( function run( wlen ) {
			const f = factorAndForm( M, N, null, wlen, true );
			return check.flattenLogical( sc, f.Q );
		}, {}, label );

		const f = factorAndForm( M, N, null, min, true );
		check.assertOrthonormal( sc, conjT( f.Q ), { 'label': label + ' Q rows orthonormal @ WORK=' + min } );
		check.assertReconstruct( sc, ref.matmul( sc, f.L, f.Q ), f.A0, { 'label': label + ' A=L*Q @ WORK=' + min } );
	});
});
