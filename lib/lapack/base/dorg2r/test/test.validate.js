/**
* Property-based validation for dorg2r, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `or`/`g2r` -> UNBLOCKED formation of
* the orthonormal factor Q (M x N, N <= M) from the Householder reflectors that
* `dgeqrf`/`dgeqr2` leave in the lower trapezoid of A (with tau in TAU). dorg2r
* CONSUMES that factorization: on input A holds the reflectors (strict lower) and
* R (on/above diagonal); on output the first N columns of A are overwritten with
* Q. The oracles are INDEPENDENT of the reflector algebra: (a) the columns of Q
* are orthonormal (QᴴQ = I), and (b) the economy reconstruction A0 = Q·R holds,
* where R is the N x N upper triangle geqrf produced. This is an exact algebraic
* identity for ANY general A, so plain random A suffices at every (M,N).
*
* dorg2r is the UNBLOCKED kernel (dlarf -> dgemv/dger per reflector); the storage
* col<->row flip legitimately reorders those sums, so layout invariance is
* asserted bit-exact only WITHIN a storage-order family and cross-order
* correctness is certified by the property sweep over all layouts.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dorg2r from './../lib/ndarray.js';
import dgeqrf from '../../dgeqrf/lib/ndarray.js';

var sc = S.real; // d-routine
var BLOCKED = false; // dorg2r is the unblocked kernel
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

// WORK length dgeqrf needs (blocked: N*NB + NB*NB; else max(1,N)).
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
// tolerance (dlarf's dgemv/dger reorder across storage order; bit-exactness is
// deferred to the layout-invariance test below).
test( 'dorg2r: QᴴQ = I and A = Q*R ((M,N) sweep x all layouts)', function t() {
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
			dgeqrf( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wf.data, Wf.args[ 0 ], Wf.args[ 1 ] );

			// Save the economy R BEFORE org overwrites A with Q.
			var R = readR( Ar, N );

			// Form Q in place: A <- Q (M x N).
			var Wo = schemes.realizeVector( sc, poison( workLenOrg( M, N ) ), TIGHT_VEC );
			dorg2r( M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo.data, Wo.args[ 0 ], Wo.args[ 1 ] );

			var Q = readFull( Ar, M, N );
			var label = 'dorg2r M=' + M + ' N=' + N + ' layout=' + li;

			checked( 'dorg2r', 'orthonormal', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
			} );

			var QR = ref.matmul( sc, Q, R );
			checked( 'dorg2r', 'reconstruct', function run() {
				check.assertReconstruct( sc, QR, A0, { 'label': label, 'factor': 100 } );
			} );
		} );
	} );
} );


// Step 3: layout invariance. Freeze the geqrf output (reflectors + tau) ONCE at a
// tight column-major layout, then re-realize those FIXED reflectors + tau at each
// storage layout and run ONLY org. dlarf/dgemv/dger pick their summation form from
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

test( 'dorg2r: bit-exact within storage-order family (col / row)', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	var MI = 48;
	var NI = 40; // K = 40 (unblocked here regardless)
	var K = NI;
	var SEED = 0xF00D;

	// Freeze the factorization once (tight col-major).
	var rng = new RNG( SEED );
	var A0 = logical.general( sc, rng, MI, NI );
	var Af = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	var Tf = schemes.realizeVector( sc, poison( NI ), TIGHT_VEC );
	var Wf = schemes.realizeVector( sc, poison( workLenFactor( MI, NI ) ), TIGHT_VEC );
	dgeqrf( MI, NI, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], Tf.data, Tf.args[ 0 ], Tf.args[ 1 ], Wf.data, Wf.args[ 0 ], Wf.args[ 1 ] );
	var Frozen = readFull( Af, MI, NI );
	var taus = [];
	var ti;
	for ( ti = 0; ti < NI; ti++ ) {
		taus.push( Tf.read( ti ) );
	}

	checked( 'dorg2r', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var Ar = schemes.dense.realize( sc, Frozen, { 'part': 'full' }, layout );
			var Tr = schemes.realizeVector( sc, taus, TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			var Wo = schemes.realizeVector( sc, poison( workLenOrg( MI, NI ) ), WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );
			dorg2r( MI, NI, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo.data, Wo.args[ 0 ], Wo.args[ 1 ] );
			return check.flattenLogical( sc, readFull( Ar, MI, NI ) );
		}, { 'label': 'dorg2r layout invariance ' + fam + '-major (M=' + MI + ' N=' + NI + ')' } );
	} );
}
