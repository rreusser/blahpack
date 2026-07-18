/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dorgr2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `orgr2` FORMS the M-by-N matrix Q
* with orthonormal ROWS (the last M rows of the N-by-N unitary) from the
* elementary reflectors an RQ factorization (dgerqf/dgerq2) leaves in the first
* K = M rows of A. This is the UNBLOCKED former (applies each reflector with a
* single dlarf), so there is NO block seam and WORK need is the plain max(1,M).
* It CONSUMES a factorization, so it is validated as the second half of the
* composition dgerqf -> dorgr2:
*
*   - factor a random general M-by-N A0 (M <= N, so k = min(M,N) = M) with
*     dgerqf; on exit the top-right M-by-M block A(0:M-1, N-M:N-1) holds R (row i
*     carries R in columns j >= N-M+i) and, strictly left of the RQ diagonal, the
*     essential Householder rows;
*   - SNAPSHOT the M-by-M upper-triangular R block before forming Q;
*   - dorgr2 overwrites A's M rows with Q (M-by-N, orthonormal rows);
*   - PROPERTY (a) orthonormal rows: Q·Qᴴ = I_M (asserted as unitarity of Qᴴ),
*     and (b) reconstruction: A0 = R·Q, where R is the M-by-M trailing triangle
*     (the leading N-M columns of the trapezoidal R are structurally zero, so
*     only the trailing M-by-M block multiplies the last M rows Q of the full
*     unitary).
*
* Both are EXACT algebraic identities for any general A, so plain random A
* suffices. dorgr2 is always unblocked; the (M,N) sweep still straddles the
* NB=32 threshold to stress the reference-copied indexing at scale.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, ref, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dgerqf from './../../dgerqf/lib/ndarray.js';
import dorgr2 from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;
const ROUTINE = 'dorgr2';
const NB = 32; // block size of the dgerqf factor (dorgr2 itself is unblocked)
const TIGHT = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// Generous WORK for the (blocked) dgerqf factor: it stores its NB-by-NB block-
// reflector T factor INSIDE WORK after the M*NB main scratch, so M*NB + NB*NB.
function gerqfWork( M ) {
	return Math.max( 1, ( M * NB ) + ( NB * NB ) );
}

// WORK the unblocked dorgr2 consumes: dlarf's C-scratch has one entry per row of
// the trailing block (at most M-1 rows), so max(1,M) is exact.
function orgWork( M ) {
	return Math.max( 1, M );
}

// (M,N) sweep with M <= N: squares (from SIZES, incl. LARGE ones) + wide (M < N)
// rectangles + zero corners.
const PAIRS = [];
SIZES.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 1, 5 ], [ 3, 7 ], [ 5, 8 ], [ 8, 16 ], [ 16, 33 ], [ 33, 48 ], [ 40, 65 ], [ 48, 64 ], [ 33, 100 ], [ 64, 100 ], [ 65, 100 ], [ 0, 4 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

// Read the M-by-M upper-triangular RQ factor R: R(i,jj) sits at physical column
// N-M+jj of factored row i, referenced only for jj >= i (the RQ diagonal p_i =
// N-M+i); everything below is structurally zero.
function readR( store, M, N ) {
	const R = new LogicalMatrix( sc, M, M );
	let i, jj;
	for ( jj = 0; jj < M; jj++ ) {
		for ( i = 0; i < M; i++ ) {
			R.set( i, jj, ( jj >= i ) ? store.read( i, N - M + jj ) : sc.zero );
		}
	}
	return R;
}

// Read the full M-by-N matrix currently in storage.
function readFull( store, M, N ) {
	const F = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, store.read( i, j ) );
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

// Factor A0 with dgerqf at `layout`, snapshot R, then form Q in place with dorgr2.
// When `poison`, dorgr2's WORK is a poisoned buffer of exactly `owlen` elements.
function factorAndForm( M, N, layout, owlen, poison ) {
	const K = M; // K = min(M,N) = M for M <= N
	const rng = new RNG( 0x100 + ( M * 100 ) + N );
	const A0 = logical.general( sc, rng, M, N );
	const R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	const TAU = schemes.realizeVector( sc, new Array( K ).fill( sc.zero ), TIGHT );
	const GW = schemes.realizeVector( sc, new Array( gerqfWork( M ) ).fill( sc.zero ), TIGHT );
	dgerqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], GW.data, GW.args[ 0 ], GW.args[ 1 ] );

	const Rm = readR( R, M, N );

	const OW = ( poison ) ? poisonedWork( sc, owlen ) : schemes.realizeVector( sc, new Array( owlen ).fill( sc.zero ), TIGHT ).data;
	dorgr2( M, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], OW, 1, 0 );

	return { 'A0': A0, 'R': Rm, 'Q': readFull( R, M, N ) };
}


// TESTS //

// Steps 2-3 (L2): orthonormal ROWS of Q AND reconstruction A0 = R*Q across the
// (M,N) sweep and every dense storage layout. dorgr2 does no pivot search, so all
// seven layouts are in contract; bit-exactness across the col<->row flip is
// deferred to the layout-invariance test below.
test( 'dorgr2: orthonormal rows (Q·Qᴴ=I) and A=R*Q ((M,N) sweep x all layouts)', function t() {
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
				check.assertReconstruct( sc, ref.matmul( sc, f.R, f.Q ), f.A0, { 'label': lbl + ' A=R*Q' } );
			});
		});
	});
});

// Step 4 (L3): layout-invariance fuzz. FREEZE the dgerqf factorization once, then
// re-realize the fixed reflectors + tau at each org-layout variant and run ONLY
// dorgr2. Within a single storage-order family the formed Q must be bit-exact
// across offset, leading-dim padding, and stride SIGN; the col<->row FLIP
// legitimately reorders the optimized dlarf->dgemv accumulation (~1 ULP), so
// cross-order agreement is certified by the reconstruction property above. TAU is
// fuzzed over positive-stride layouts; WORK over unit-stride layouts (dorgr2
// passes strideWork straight through, so any stride is honored, but keeping WORK
// unit-stride keeps the invariance families disjoint on the arithmetic-order axis).
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
	const GW = schemes.realizeVector( sc, new Array( gerqfWork( M ) ).fill( sc.zero ), TIGHT );
	dgerqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], GW.data, GW.args[ 0 ], GW.args[ 1 ] );
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
			dorgr2( M, N, K, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], OW.data, OW.args[ 0 ], OW.args[ 1 ] );
			return check.flattenLogical( sc, readFull( R, M, N ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	});
}

test( 'dorgr2: bit-exact Q within storage-order family (col / row)', function t() {
	[ [ 5, 8 ], [ 12, 20 ], [ 16, 16 ], [ 33, 48 ] ].forEach( function eachSize( sz ) {
		const fr = freezeFactor( sz[ 0 ], sz[ 1 ] );
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ], fr );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ], fr );
	});
});

// Step 4c: workspace conformance. dorgr2 is unblocked and genuinely needs only
// max(1,M) WORK, so the advertised minimum should suffice trivially. Probe the
// wrapper's throw boundary, then run at exactly that length with a POISONED buffer
// and require finite Q + orthonormality + reconstruction — a read-before-write or
// an under-count would over-read poisoned padding -> NaN and fail loudly.
test( 'dorgr2: advertised WORK minimum suffices (poisoned)', function t() {
	[ [ 40, 40 ], [ 33, 80 ], [ 64, 100 ] ].forEach( function eachCase( c ) {
		const M = c[ 0 ];
		const N = c[ 1 ];
		const label = ROUTINE + ' WORK-sufficiency ' + M + 'x' + N;
		const min = assertWorkspaceSufficient( function run( wlen ) {
			const f = factorAndForm( M, N, null, wlen, true );
			return check.flattenLogical( sc, f.Q );
		}, {}, label );

		const f = factorAndForm( M, N, null, min, true );
		check.assertOrthonormal( sc, conjT( f.Q ), { 'label': label + ' Q rows orthonormal @ WORK=' + min } );
		check.assertReconstruct( sc, ref.matmul( sc, f.R, f.Q ), f.A0, { 'label': label + ' A=R*Q @ WORK=' + min } );
	});
});
