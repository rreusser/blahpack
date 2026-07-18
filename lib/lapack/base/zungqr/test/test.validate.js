/**
* Property-based validation for zungqr, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `or`/`gqr` -> BLOCKED formation of
* the orthonormal factor Q (M x N, N <= M) from the Householder reflectors that
* `zgeqrf` leave in the lower trapezoid of A (with tau in TAU). zungqr
* CONSUMES that factorization: on input A holds the reflectors (strict lower) and
* R (on/above diagonal); on output the first N columns of A are overwritten with
* Q. The oracles are INDEPENDENT of the reflector algebra: (a) the columns of Q
* are orthonormal (QᴴQ = I), and (b) the economy reconstruction A0 = Q·R holds,
* where R is the N x N upper triangle geqrf produced. This is an exact algebraic
* identity for ANY general A, so plain random A suffices at every (M,N).
*
* zungqr is the BLOCKED kernel (zlarft + zlarfb -> zgemm/ztrmm, falling back to
* zung2r for the trailing panel); the storage col<->row flip legitimately
* reorders those sums, so layout invariance is asserted bit-exact only WITHIN a
* storage-order family and cross-order correctness is certified by the property
* sweep over all layouts. WORK is caller-owned: the blocked path stores the
* block-reflector T factor (leading dim N) + zlarfb scratch in it, advertised
* minimum `max(1, N*NB)` (NB=32) when K > NB; Step 4c probes that the advertised
* minimum actually suffices under a poisoned buffer.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zungqr from './../lib/ndarray.js';
import zgeqrf from '../../zgeqrf/lib/ndarray.js';

var sc = S.complex; // z-routine
var BLOCKED = true; // zungqr is the blocked kernel (zlarft + zlarfb -> zgemm/ztrmm)
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32; // geqrf hardcoded block size (governs the geqrf WORK length only)

// (M,N) sweep with M >= N (QR economy factor): squares from SIZES (incl. the
// LARGE 48/63/64/65/100) + tall rectangulars + zero/degenerate corners.
var PAIRS = [];
SIZES.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 5, 3 ], [ 8, 4 ], [ 16, 7 ], [ 33, 17 ], [ 48, 20 ], [ 65, 40 ], [ 100, 33 ], [ 4, 1 ], [ 33, 32 ], [ 48, 33 ], [ 64, 32 ], [ 80, 33 ], [ 3, 0 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
} );

var ALL_LAYOUTS = schemes.dense.layouts();
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };
var TAU_LAYOUTS = schemes.vectorLayouts();
var WORK_LAYOUTS = BLOCKED ?
	[ { 'stride': 1, 'lead': 0, 'tail': 0 }, { 'stride': 1, 'lead': 3, 'tail': 2 }, { 'stride': 1, 'lead': 1, 'tail': 0 }, { 'stride': 1, 'lead': 5, 'tail': 4 } ] :
	schemes.vectorLayouts().filter( function pos( L ) {
		return L.stride > 0;
	} );


// HELPERS //

// WORK length zgeqrf needs (blocked: N*NB + NB*NB; else max(1,N)).
function workLenFactor( M, N ) {
	var K = Math.min( M, N );
	return ( K > NB ) ? ( ( N * NB ) + ( NB * NB ) ) : Math.max( 1, N );
}

// WORK length the org routine needs (blocked orgqr: N*NB when K>NB; else N).
function workLenOrg( M, N ) {
	var K = N; // K = N here
	if ( BLOCKED && K > NB ) {
		return N * NB;
	}
	return Math.max( 1, N );
}

// A poisoned (NaN) vector so any unwritten output slot reads back NaN.
function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// The economy R factor (N x N upper triangle) read out of a factored A.
function readR( Ard, N ) {
	var R = new LogicalMatrix( sc, N, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			R.set( i, j, ( i <= j ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	return R;
}

// Read the full M x N matrix out of physical storage into a LogicalMatrix.
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


// Steps 2/3/5: orthonormality (QᴴQ = I) AND economy reconstruction (A0 = Q·R)
// across the (M,N) sweep and every dense storage layout, at backward-error
// tolerance (zlarf's zgemv/zgerc reorder across storage order; bit-exactness is
// deferred to the layout-invariance test below).
test( 'zungqr: QᴴQ = I and A = Q*R ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		var K = N;
		ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
			var rng = new RNG( 0x100 + ( M * 100 ) + N ); // reproducible; log on failure
			var A0 = logical.general( sc, rng, M, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = schemes.realizeVector( sc, poison( Math.max( N, 1 ) ), TIGHT_VEC );
			var Wf = schemes.realizeVector( sc, poison( workLenFactor( M, N ) ), TIGHT_VEC );

			// Factor: A <- reflectors + R.
			zgeqrf( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wf.data, Wf.args[ 0 ], Wf.args[ 1 ] );

			// Save the economy R BEFORE org overwrites A with Q.
			var R = readR( Ar, N );

			// Form Q in place: A <- Q (M x N).
			var Wo = schemes.realizeVector( sc, poison( workLenOrg( M, N ) ), TIGHT_VEC );
			zungqr( M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo.data, Wo.args[ 0 ], Wo.args[ 1 ] );

			var Q = readFull( Ar, M, N );
			var label = 'zungqr M=' + M + ' N=' + N + ' layout=' + li;

			checked( 'zungqr', 'orthonormal', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
			} );

			var QR = ref.matmul( sc, Q, R );
			checked( 'zungqr', 'reconstruct', function run() {
				check.assertReconstruct( sc, QR, A0, { 'label': label, 'factor': 100 } );
			} );
		} );
	} );
} );


// Step 3: layout invariance. Freeze the geqrf output (reflectors + tau) ONCE at a
// tight column-major layout, then re-realize those FIXED reflectors + tau at each
// storage layout and run ONLY org. zlarf/zgemv/zgerc pick their summation form from
// operand strides, so assert BIT-EXACTNESS only WITHIN a storage-order family
// (col / row); offset, leading-dim padding and stride sign are still fuzzed.
// TAU/WORK vector layouts vary in parallel (WORK positive-stride: the guard
// measures length - offset).
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );

test( 'zungqr: bit-exact within storage-order family (col / row)', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	var MI = 48;
	var NI = 40; // K = 40 > NB=32 -> BLOCKED path (zlarft/zlarfb reached)
	var K = NI;
	var SEED = 0xF00D;

	// Freeze the factorization once (tight col-major).
	var rng = new RNG( SEED );
	var A0 = logical.general( sc, rng, MI, NI );
	var Af = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	var Tf = schemes.realizeVector( sc, poison( NI ), TIGHT_VEC );
	var Wf = schemes.realizeVector( sc, poison( workLenFactor( MI, NI ) ), TIGHT_VEC );
	zgeqrf( MI, NI, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], Tf.data, Tf.args[ 0 ], Tf.args[ 1 ], Wf.data, Wf.args[ 0 ], Wf.args[ 1 ] );
	var Frozen = readFull( Af, MI, NI );
	var taus = [];
	var ti;
	for ( ti = 0; ti < NI; ti++ ) {
		taus.push( Tf.read( ti ) );
	}

	checked( 'zungqr', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var Ar = schemes.dense.realize( sc, Frozen, { 'part': 'full' }, layout );
			var Tr = schemes.realizeVector( sc, taus, TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			var Wo = schemes.realizeVector( sc, poison( workLenOrg( MI, NI ) ), WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );
			zungqr( MI, NI, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo.data, Wo.args[ 0 ], Wo.args[ 1 ] );
			return check.flattenLogical( sc, readFull( Ar, MI, NI ) );
		}, { 'label': 'zungqr layout invariance ' + fam + '-major (M=' + MI + ' N=' + NI + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). zungqr hardcodes
// NB and stores the block-reflector T factor (leading dim N) plus zlarfb scratch in
// the caller-provided WORK, so a copied reference LWORK could UNDER-count. Derive
// the advertised minimum from the wrapper's own throw boundary, then run at exactly
// that length with a POISONED WORK on the BLOCKED path (M=N=80, K=80 > NB) and
// require finite Q (no NaN leak past WORK) AND orthonormality.
test( 'zungqr: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	var M = 80;
	var N = 80;
	var K = N; // K = 80 > NB=32 -> blocked
	var SEED = 0xB10C;
	var label = 'zungqr WORK-min M=' + M + ' N=' + N;

	// Freeze one deterministic factorization; org is then run per WORK length.
	var rng = new RNG( SEED );
	var A0 = logical.general( sc, rng, M, N );
	var Af = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	var Tf = schemes.realizeVector( sc, poison( N ), TIGHT_VEC );
	var Wf = schemes.realizeVector( sc, poison( workLenFactor( M, N ) ), TIGHT_VEC );
	zgeqrf( M, N, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], Tf.data, Tf.args[ 0 ], Tf.args[ 1 ], Wf.data, Wf.args[ 0 ], Wf.args[ 1 ] );
	var Frozen = readFull( Af, M, N );
	var taus = [];
	var ti;
	for ( ti = 0; ti < N; ti++ ) {
		taus.push( Tf.read( ti ) );
	}

	// `run(len)`: form Q with a poisoned WORK of `len` (ndarray form, strideWork=1,
	// offsetWork=0), return flat Q components. Throws the wrapper RangeError below
	// its advertised minimum.
	function run( len ) {
		var Ar = schemes.dense.realize( sc, Frozen, { 'part': 'full' }, null );
		var Tr = schemes.realizeVector( sc, taus, TIGHT_VEC );
		var Wo = poisonedWork( sc, len );
		zungqr( M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo, 1, 0 );
		return check.flattenLogical( sc, readFull( Ar, M, N ) );
	}

	// The wrapper must reject below its advertised minimum and that minimum must
	// produce fully-finite output at a poisoned buffer of exactly that length.
	var minLen = assertWorkspaceSufficient( run, {}, label );

	// The blocked path must actually have been taken (K > NB), else this asserts
	// nothing about the block seam.
	if ( K <= NB ) {
		throw new Error( label + ': case is not on the blocked path (K<=NB); pick larger dims' );
	}

	// And orthonormality must still hold at exactly that advertised minimum.
	var Ar = schemes.dense.realize( sc, Frozen, { 'part': 'full' }, null );
	var Tr = schemes.realizeVector( sc, taus, TIGHT_VEC );
	var Wo = poisonedWork( sc, minLen );
	zungqr( M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo, 1, 0 );
	check.assertOrthonormal( sc, readFull( Ar, M, N ), { 'label': label + ' (WORK=' + minLen + ') Q' } );
} );
