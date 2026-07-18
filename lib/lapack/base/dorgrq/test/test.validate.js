/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dorgrq, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `orgrq` FORMS the M-by-N matrix Q
* with orthonormal ROWS (the last M rows of the N-by-N orthogonal factor) from the
* elementary reflectors an RQ factorization (dgerqf) leaves in the first K = M
* rows of A. This is the BLOCKED former: it batches the reflectors through
* dlarft/dlarfb (an optimized dgemm) and falls back to the unblocked dorgr2 for
* the trailing panel, producing EXACTLY the same Q. It CONSUMES a factorization,
* so it is validated as the second half of the composition dgerqf -> dorgrq:
*
*   - factor a random general M-by-N A0 (M <= N, k = min(M,N) = M) with dgerqf; on
*     exit the top-right M-by-M block A(0:M-1, N-M:N-1) holds R (row i carries R in
*     columns j >= N-M+i) and, strictly left of the RQ diagonal, the essential
*     Householder rows;
*   - SNAPSHOT the M-by-M upper-triangular R block before forming Q;
*   - dorgrq overwrites A's M rows with Q (M-by-N, orthonormal rows);
*   - PROPERTY (a) orthonormal rows: Q·Qᴴ = I_M (unitarity of Qᴴ), and (b)
*     reconstruction: A0 = R·Q with R the M-by-M trailing triangle (the leading
*     N-M columns of the trapezoidal R are structurally zero, so only the trailing
*     M-by-M block multiplies the last M rows Q of the full orthogonal factor).
*
* Both are EXACT algebraic identities for any general A, so plain random A
* suffices. The block size is hardcoded NB = 32, so the blocked dlarft/dlarfb path
* is taken whenever K = M > 32; the (M,N) sweep straddles that threshold.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, ref, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dgerqf from './../../dgerqf/lib/ndarray.js';
import dorgrq from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var ROUTINE = 'dorgrq';
var NB = 32; // hardcoded block size in lib/base.js
var TIGHT = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// Generous WORK for the (blocked) dgerqf factor: M*NB + NB*NB (stores T inside
// WORK after the M*NB main scratch).
function gerqfWork( M ) {
	return Math.max( 1, ( M * NB ) + ( NB * NB ) );
}

// WORK the blocked dorgrq consumes: dlarft stores its ib-by-ib T factor with
// leading dimension LDWORK = M, and dlarfb reuses the same buffer at offset ib,
// so the blocked path needs M*NB scratch (matching reference DORGRQ's
// IWS = LDWORK*NB); the unblocked fallback (K <= NB) needs only M.
function orgWork( M ) {
	return Math.max( 1, M * NB );
}

// (M,N) sweep with M <= N: squares straddling NB=32 (from SIZES, incl. the LARGE
// 48/63/64/65/100 that exercise dlarft/dlarfb) + wide (M < N) rectangles crossing
// the threshold + zero corners.
var PAIRS = [];
SIZES.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 1, 5 ], [ 3, 7 ], [ 5, 8 ], [ 8, 16 ], [ 16, 33 ], [ 33, 48 ], [ 40, 65 ], [ 48, 64 ], [ 33, 100 ], [ 64, 100 ], [ 65, 100 ], [ 0, 4 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

// Read the M-by-M upper-triangular RQ factor R: R(i,jj) sits at physical column
// N-M+jj of factored row i, referenced only for jj >= i (RQ diagonal p_i=N-M+i).
function readR( store, M, N ) {
	var R = new LogicalMatrix( sc, M, M );
	var i;
	var jj;
	for ( jj = 0; jj < M; jj++ ) {
		for ( i = 0; i < M; i++ ) {
			R.set( i, jj, ( jj >= i ) ? store.read( i, N - M + jj ) : sc.zero );
		}
	}
	return R;
}

function readFull( store, M, N ) {
	var F = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, store.read( i, j ) );
		}
	}
	return F;
}

// Conjugate transpose T (N x M): T(j,i) = conj(Q(i,j)); columns of T are rows of
// Q, so assertOrthonormal(T) checks T^H T = Q Q^H = I_M.
function conjT( Q ) {
	var T = new LogicalMatrix( sc, Q.cols, Q.rows );
	var i;
	var j;
	for ( i = 0; i < Q.rows; i++ ) {
		for ( j = 0; j < Q.cols; j++ ) {
			T.set( j, i, sc.conj( Q.get( i, j ) ) );
		}
	}
	return T;
}

function factorAndForm( M, N, layout, owlen, poison ) {
	var K = M; // K = min(M,N) = M for M <= N
	var rng = new RNG( 0x100 + ( M * 100 ) + N );
	var A0 = logical.general( sc, rng, M, N );
	var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	var TAU = schemes.realizeVector( sc, new Array( K ).fill( sc.zero ), TIGHT );
	var GW = schemes.realizeVector( sc, new Array( gerqfWork( M ) ).fill( sc.zero ), TIGHT );
	dgerqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], GW.data, GW.args[ 0 ], GW.args[ 1 ] );

	var Rm = readR( R, M, N );

	var OW = ( poison ) ? poisonedWork( sc, owlen ) : schemes.realizeVector( sc, new Array( owlen ).fill( sc.zero ), TIGHT ).data;
	dorgrq( M, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], OW, 1, 0 );

	return { 'A0': A0, 'R': Rm, 'Q': readFull( R, M, N ) };
}


// TESTS //

// Steps 2-3 (L2): orthonormal ROWS of Q AND reconstruction A0 = R*Q across the
// (M,N) sweep (blocked + unblocked) and every dense storage layout.
test( 'dorgrq: orthonormal rows (Q·Qᴴ=I) and A=R*Q ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		schemes.dense.layouts().forEach( function eachLayout( layout, li ) {
			var f = factorAndForm( M, N, layout, orgWork( M ), false );
			var lbl = ROUTINE + ' M=' + M + ' N=' + N + ' layout=' + li;
			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, conjT( f.Q ), { 'label': lbl + ' Q rows orthonormal' } );
			});
			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, ref.matmul( sc, f.R, f.Q ), f.A0, { 'label': lbl + ' A=R*Q' } );
			});
		});
	});
});

// Step 4 (L3): layout-invariance fuzz on genuinely BLOCKED sizes (K = M > 32, each
// triggering dlarft/dlarfb). FREEZE the dgerqf factorization once, then re-realize
// the fixed reflectors + tau at each org-layout variant and run ONLY dorgrq. Within
// a single storage-order family the formed Q must be bit-exact across offset,
// leading-dim padding, and stride SIGN; the col<->row FLIP legitimately reorders
// the optimized dlarfb->dgemm accumulation (~1 ULP), so cross-order agreement is
// certified by the reconstruction property above. TAU is fuzzed over positive-
// stride layouts; WORK over UNIT-stride layouts only, because base.js passes
// stride 1 (not strideWork) to dlarft/dlarfb, so a non-unit WORK stride is out of
// contract on the blocked path — offset/lead still varied.
var VLAYOUTS = schemes.vectorLayouts();
var TAULAYOUTS = VLAYOUTS.filter( function pos( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) > 0;
});
var WLAYOUTS = VLAYOUTS.filter( function unit( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) === 1;
});
var colLayouts = schemes.dense.layouts().filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = schemes.dense.layouts().filter( function isRow( L ) {
	return L.order === 'row';
});

function freezeFactor( M, N ) {
	var K = M;
	var rng = new RNG( 0xF00D + ( M * 17 ) + N );
	var A0 = logical.general( sc, rng, M, N );
	var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	var TAU = schemes.realizeVector( sc, new Array( K ).fill( sc.zero ), TIGHT );
	var GW = schemes.realizeVector( sc, new Array( gerqfWork( M ) ).fill( sc.zero ), TIGHT );
	dgerqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], GW.data, GW.args[ 0 ], GW.args[ 1 ] );
	var taus = [];
	var i;
	for ( i = 0; i < K; i++ ) {
		taus.push( TAU.read( i ) );
	}
	return { 'F': readFull( R, M, N ), 'taus': taus };
}

function runInvariance( variants, fam, M, N, fr ) {
	var K = M;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var R = schemes.dense.realize( sc, fr.F, { 'part': 'full' }, layout );
			var TAU = schemes.realizeVector( sc, fr.taus, TAULAYOUTS[ i % TAULAYOUTS.length ] );
			var OW = schemes.realizeVector( sc, new Array( orgWork( M ) ).fill( sc.zero ), WLAYOUTS[ i % WLAYOUTS.length ] );
			dorgrq( M, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], OW.data, OW.args[ 0 ], OW.args[ 1 ] );
			return check.flattenLogical( sc, readFull( R, M, N ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	});
}

test( 'dorgrq: bit-exact Q within storage-order family (col / row), blocked path', function t() {
	[ [ 40, 50 ], [ 48, 64 ], [ 33, 48 ], [ 64, 80 ] ].forEach( function eachSize( sz ) {
		var fr = freezeFactor( sz[ 0 ], sz[ 1 ] );
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
test( 'dorgrq: advertised WORK minimum suffices on the blocked path (poisoned)', function t() {
	[ [ 80, 80 ], [ 48, 120 ] ].forEach( function eachCase( c ) {
		var M = c[ 0 ];
		var N = c[ 1 ];
		var label = ROUTINE + ' WORK-sufficiency ' + M + 'x' + N;

		// The blocked path must actually be taken (K = M > NB), else this asserts
		// nothing about the block seam.
		if ( M <= NB ) {
			throw new Error( label + ': not on the blocked path (M<=NB); pick larger M' );
		}

		var min = assertWorkspaceSufficient( function run( wlen ) {
			var f = factorAndForm( M, N, null, wlen, true );
			return check.flattenLogical( sc, f.Q );
		}, {}, label );

		var f = factorAndForm( M, N, null, min, true );
		check.assertOrthonormal( sc, conjT( f.Q ), { 'label': label + ' Q rows orthonormal @ WORK=' + min } );
		check.assertReconstruct( sc, ref.matmul( sc, f.R, f.Q ), f.A0, { 'label': label + ' A=R*Q @ WORK=' + min } );
	});
});
