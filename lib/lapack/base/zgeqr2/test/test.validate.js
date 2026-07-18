/**
* Property-based validation for zgeqr2, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `qr2` (unblocked QR by Householder
* reflections) -> reconstruction A = Q*R AND orthonormality QᴴQ = I.
*
* The factorization A = Q*R is an EXACT algebraic identity for ANY general A
* (it is the definition of the Householder QR, not a solve), so conditioning is
* irrelevant and plain random general A suffices. On output the reference
* stores, for reflector i (i = 0..k-1, k = min(M,N)): the upper trapezoid of A
* is R, the strict lower part of column i holds v_i(i+1:M-1) with an implicit
* v_i(i) = 1, and TAU(i) is the scalar factor. H_i = I − tau_i·v_i·v_iᴴ and
* Q = H_1·H_2·…·H_k, so A0 = H_1·(H_2·(…·(H_k·R))).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zgeqr2 from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

// (M,N) sweep: squares straddling unroll/block thresholds + rectangular (both
// orientations: M >= N and M < N) + zero-dimension corners.
const PAIRS = [];
SIZES_SMALL.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 5, 3 ], [ 3, 5 ], [ 8, 4 ], [ 4, 8 ], [ 16, 7 ], [ 7, 16 ], [ 33, 17 ], [ 17, 33 ], [ 1, 4 ], [ 4, 1 ], [ 0, 0 ], [ 0, 3 ], [ 3, 0 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
} );

const ALL_LAYOUTS = schemes.dense.layouts();
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// A poisoned (NaN) vector of scalar values, so an output slot the routine fails
// to write reads back as NaN and trips assertFinite.
function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Read the upper trapezoid of the factored A as the M x N factor R (strict
// lower = zero).
function readR( Ard, M, N ) {
	const Rm = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Rm.set( i, j, ( i <= j ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	return Rm;
}

// Extract the k Householder vectors (each length M): v_t(t) = 1 (implicit),
// v_t(t+1:M-1) = strict-lower column t of the factored A, v_t(0:t-1) = 0.
function readVecs( Ard, M, k ) {
	const vs = [];
	let v, t, r;
	for ( t = 0; t < k; t++ ) {
		v = new Array( M );
		for ( r = 0; r < M; r++ ) {
			if ( r < t ) {
				v[ r ] = sc.zero;
			} else if ( r === t ) {
				v[ r ] = sc.one;
			} else {
				v[ r ] = Ard.read( r, t );
			}
		}
		vs.push( v );
	}
	return vs;
}

// Mtx := H·Mtx where H = I − tau·v·vᴴ, i.e. Mtx -= tau·v·(vᴴ·Mtx). `v` is
// length Mtx.rows.
function applyH( Mtx, v, tau ) {
	const rows = Mtx.rows;
	const cols = Mtx.cols;
	let w, tw, c, r;
	for ( c = 0; c < cols; c++ ) {
		w = sc.zero; // w = vᴴ·Mtx[:,c] = sum_r conj(v[r])·Mtx[r][c]
		for ( r = 0; r < rows; r++ ) {
			w = sc.add( w, sc.mul( sc.conj( v[ r ] ), Mtx.get( r, c ) ) );
		}
		tw = sc.mul( tau, w );
		for ( r = 0; r < rows; r++ ) {
			Mtx.set( r, c, sc.sub( Mtx.get( r, c ), sc.mul( v[ r ], tw ) ) );
		}
	}
}

// Reconstruct A = H_1·(H_2·(…·(H_k·R))) by folding reflectors right-to-left.
function reconstruct( Ard, taus, M, N, k ) {
	const Mtx = readR( Ard, M, N );
	const vs = readVecs( Ard, M, k );
	let t;
	for ( t = k - 1; t >= 0; t-- ) {
		applyH( Mtx, vs[ t ], taus[ t ] );
	}
	return Mtx;
}

// Form Q (M x k) = H_1·…·H_k applied to the first k columns of the M x M
// identity.
function formQ( Ard, taus, M, k ) {
	const Q = new LogicalMatrix( sc, M, k );
	const vs = readVecs( Ard, M, k );
	let t, i, j;
	for ( j = 0; j < k; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Q.set( i, j, ( i === j ) ? sc.one : sc.zero );
		}
	}
	for ( t = k - 1; t >= 0; t-- ) {
		applyH( Q, vs[ t ], taus[ t ] );
	}
	return Q;
}

// Read the full factored A (M x N) back into a LogicalMatrix (reflectors below
// the diagonal, R on/above it).
function readFull( Ard, M, N ) {
	const F = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}


// Steps 2/3/5: reconstruction (A = Q*R) AND orthonormality (QᴴQ = I) across the
// (M,N) sweep and every dense storage layout, at backward-error tolerance (the
// optimized dgemv/dger inside dlarf reorder across storage order, so exactness
// is deferred to the layout-invariance test below).
test( 'zgeqr2: A = Q*R and QᴴQ = I ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		const k = Math.min( M, N );
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			const rng = new RNG( 0x100 + ( M * 100 ) + N ); // reproducible; log on failure
			const A0 = logical.general( sc, rng, M, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
			const Wr = schemes.realizeVector( sc, poison( Math.max( 1, N ) ), TIGHT_VEC );

			zgeqr2( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			const taus = [];
			let ti;
			for ( ti = 0; ti < k; ti++ ) {
				taus.push( Tr.read( ti ) );
			}
			const label = 'zgeqr2 M=' + M + ' N=' + N + ' layout=' + li;

			const recon = reconstruct( Ar, taus, M, N, k );
			checked( 'zgeqr2', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, A0, { 'label': label } );
			} );

			const Q = formQ( Ar, taus, M, k );
			checked( 'zgeqr2', 'orthonormal', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz. zgeqr2 -> dlarf -> optimized dgemv/dger, which
// pick their summation form by comparing operand strides, so the col<->row
// storage FLIP legitimately reorders the arithmetic (~1 ULP) while the
// reconstruction property above proves the flipped result is still correct.
// Therefore assert BIT-EXACTNESS only WITHIN a storage-order family (col vs
// row); this still fuzzes offset, leading-dim padding, and stride SIGN — the
// real indexing-bug detectors. TAU/WORK vector layouts are fuzzed in parallel;
// they must not perturb the factored A. (WORK stays positive-stride: the
// ndarray WORK-length guard measures `length - offset`, which a negative stride
// would spuriously fail.)
const colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
const rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
const TAU_LAYOUTS = schemes.vectorLayouts();
const WORK_LAYOUTS = schemes.vectorLayouts().filter( function pos( L ) {
	return L.stride > 0;
} );

test( 'zgeqr2: bit-exact within storage-order family (col / row)', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	const M = 8;
	const N = 5;
	const k = Math.min( M, N );
	const SEED = 0xF00D;
	checked( 'zgeqr2', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A0 = logical.general( sc, rng, M, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const Tr = schemes.realizeVector( sc, poison( k ), TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			const Wr = schemes.realizeVector( sc, poison( Math.max( 1, N ) ), WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );

			zgeqr2( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			return check.flattenLogical( sc, readFull( Ar, M, N ) );
		}, { 'label': 'zgeqr2 layout invariance ' + fam + '-major' } );
	} );
}
