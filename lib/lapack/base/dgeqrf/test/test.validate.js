/**
* Property-based validation for dgeqrf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `qrf` (BLOCKED QR by Householder
* reflections) -> reconstruction A = Q*R AND orthonormality QᴴQ = I.
*
* The BLOCKED factorization stores EXACTLY the same result as the unblocked
* `dgeqr2`: the upper trapezoid of A is R, the strict lower part of column i
* holds v_i(i+1:M-1) with an implicit v_i(i) = 1, and TAU(i) is the scalar
* factor. H_i = I − tau_i·v_i·v_iᴴ and Q = H_1·H_2·…·H_k, so the reconstruction
* and orthonormality oracles are IDENTICAL to dgeqr2's — only the internal path
* differs (dgeqr2 panel + dlarft/dlarfb block update reaching dgemm/dtrsm). The
* factorization A = Q*R is an EXACT algebraic identity for ANY general A, so
* plain random general A suffices at every (M,N).
*
* The block size is hardcoded NB = 32, so the blocked path is taken whenever
* min(M,N) > 32; the sweep straddles that threshold (…,31,32,33,48,63,64,65,100).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dgeqrf from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32; // hardcoded block size in lib/base.js

// (M,N) sweep: squares straddling the NB=32 block threshold (from SIZES,
// including the LARGE 48/63/64/65/100 that exercise the blocked path) +
// rectangular (both orientations: M >= N and M < N) crossing the threshold +
// zero-dimension corners.
var PAIRS = [];
SIZES.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 5, 3 ], [ 3, 5 ], [ 8, 4 ], [ 4, 8 ], [ 16, 7 ], [ 7, 16 ], [ 33, 17 ], [ 17, 33 ], [ 48, 20 ], [ 20, 48 ], [ 65, 40 ], [ 40, 65 ], [ 100, 33 ], [ 33, 100 ], [ 1, 4 ], [ 4, 1 ], [ 0, 0 ], [ 0, 3 ], [ 3, 0 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
} );

var ALL_LAYOUTS = schemes.dense.layouts();
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// The WORK length the ndarray dgeqrf actually needs: on the blocked path
// (min(M,N) > NB) it partitions WORK into the dlarfb update block (N*NB, logical
// leading dim N) followed by the NB×NB reflector-T factor, so N*NB + NB*NB; the
// unblocked path needs only max(1,N).
function workLen( M, N ) {
	var K = Math.min( M, N );
	return ( K > NB ) ? ( ( N * NB ) + ( NB * NB ) ) : Math.max( 1, N );
}

// A poisoned (NaN) vector of scalar values, so an output slot the routine fails
// to write reads back as NaN and trips assertFinite.
function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Read the upper trapezoid of the factored A as the M x N factor R (strict
// lower = zero).
function readR( Ard, M, N ) {
	var Rm = new LogicalMatrix( sc, M, N );
	var i;
	var j;
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
	var vs = [];
	var v;
	var t;
	var r;
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
	var rows = Mtx.rows;
	var cols = Mtx.cols;
	var w;
	var tw;
	var c;
	var r;
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
	var Mtx = readR( Ard, M, N );
	var vs = readVecs( Ard, M, k );
	var t;
	for ( t = k - 1; t >= 0; t-- ) {
		applyH( Mtx, vs[ t ], taus[ t ] );
	}
	return Mtx;
}

// Form Q (M x k) = H_1·…·H_k applied to the first k columns of the M x M
// identity.
function formQ( Ard, taus, M, k ) {
	var Q = new LogicalMatrix( sc, M, k );
	var vs = readVecs( Ard, M, k );
	var t;
	var i;
	var j;
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
	var F = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}


// Steps 2/3/5: reconstruction (A = Q*R) AND orthonormality (QᴴQ = I) across the
// (M,N) sweep (blocked and unblocked) and every dense storage layout, at
// backward-error tolerance (the optimized dgemv/dger/dgemm/dtrsm inside
// dlarf/dlarfb reorder across storage order, so bit-exactness is deferred to the
// layout-invariance test below).
test( 'dgeqrf: A = Q*R and QᴴQ = I ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var k = Math.min( M, N );
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			var rng = new RNG( 0x100 + ( M * 100 ) + N ); // reproducible; log on failure
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
			var Wr = schemes.realizeVector( sc, poison( workLen( M, N ) ), TIGHT_VEC );

			dgeqrf( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			var taus = [];
			var ti;
			for ( ti = 0; ti < k; ti++ ) {
				taus.push( Tr.read( ti ) );
			}
			var label = 'dgeqrf M=' + M + ' N=' + N + ' layout=' + li;

			var recon = reconstruct( Ar, taus, M, N, k );
			checked( 'dgeqrf', 'reconstruct', function run() {
				check.assertReconstruct( sc, recon, A0, { 'label': label } );
			} );

			var Q = formQ( Ar, taus, M, k );
			checked( 'dgeqrf', 'orthonormal', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz. The BLOCKED path (M=40,N=32 -> min=32 is NOT
// > NB, so pick M=40,N=32? no) must reach dlarfb -> dgemm/dtrsm. dgeqrf ->
// dgeqr2 (panel) + dlarft + dlarfb, whose optimized dgemv/dger/dgemm/dtrsm pick
// their summation form by comparing operand strides, so the col<->row storage
// FLIP legitimately reorders the arithmetic (~1 ULP) while the reconstruction
// property above proves the flipped result is still correct. Therefore assert
// BIT-EXACTNESS only WITHIN a storage-order family (col vs row); this still
// fuzzes offset, leading-dim padding, and stride SIGN — the real indexing-bug
// detectors. TAU/WORK vector layouts are fuzzed in parallel; they must not
// perturb the factored A. (WORK stays positive-stride: the ndarray WORK-length
// guard measures `length - offset`, which a negative stride would spuriously
// fail.)
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
var TAU_LAYOUTS = schemes.vectorLayouts();
var WORK_LAYOUTS = schemes.vectorLayouts().filter( function pos( L ) {
	return L.stride > 0;
} );

test( 'dgeqrf: bit-exact within storage-order family (col / row), blocked', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	var M = 40; // min(M,N) = 32 is NOT > NB; force blocked with N > NB below
	var N = 40; // min = 40 > NB=32 -> BLOCKED path (dlarft/dlarfb reached)
	var k = Math.min( M, N );
	var SEED = 0xF00D;
	checked( 'dgeqrf', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = schemes.realizeVector( sc, poison( k ), TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			var Wr = schemes.realizeVector( sc, poison( workLen( M, N ) ), WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );

			dgeqrf( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			return check.flattenLogical( sc, readFull( Ar, M, N ) );
		}, { 'label': 'dgeqrf layout invariance ' + fam + '-major (blocked M=' + M + ' N=' + N + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). Our JS
// hardcodes NB and stores the block-reflector T in a SEPARATE trailing block, so
// a copied reference LWORK could UNDER-count. Derive the advertised minimum from
// the wrapper's own throw boundary, then run at exactly that length with a
// POISONED WORK on the BLOCKED path and require finite output (no NaN leak from
// reading past WORK) AND reconstruction. Test one square blocked and one tall
// (M≫N) blocked case.
test( 'dgeqrf: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	[ [ 80, 80 ], [ 200, 40 ] ].forEach( function eachCase( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var k = Math.min( M, N );
		var SEED = 0xB10C + ( M * 7 ) + N;
		var label = 'dgeqrf WORK-min M=' + M + ' N=' + N;

		// `run(len)`: factor a deterministic A with a poisoned WORK of `len`
		// (ndarray form, strideWork=1, offsetWork=0), return flat A components.
		function run( len ) {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
			var Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
			var Wr = poisonedWork( sc, len );
			dgeqrf( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr, 1, 0 );
			return check.flattenLogical( sc, readFull( Ar, M, N ) );
		}

		// The wrapper must reject below its advertised minimum and that minimum
		// must produce fully-finite output at a poisoned buffer of exactly that
		// length.
		var minLen = assertWorkspaceSufficient( run, {}, label );

		// The blocked path must actually have been taken (min > NB), else this
		// asserts nothing about the block seam.
		if ( k <= NB ) {
			throw new Error( label + ': case is not on the blocked path (min<=NB); pick larger dims' );
		}

		// And reconstruction must still hold at exactly that advertised minimum.
		var rng = new RNG( SEED );
		var A0 = logical.general( sc, rng, M, N );
		var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
		var Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
		var Wr = poisonedWork( sc, minLen );
		dgeqrf( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr, 1, 0 );
		var taus = [];
		var ti;
		for ( ti = 0; ti < k; ti++ ) {
			taus.push( Tr.read( ti ) );
		}
		var recon = reconstruct( Ar, taus, M, N, k );
		check.assertReconstruct( sc, recon, A0, { 'label': label + ' (WORK=' + minLen + ')' } );
	} );
} );
