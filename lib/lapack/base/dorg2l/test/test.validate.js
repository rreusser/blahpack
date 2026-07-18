/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dorg2l, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `or`/`g2l` -> UNBLOCKED formation of
* the orthonormal factor Q (M x N economy, N <= M) from the Householder reflectors
* that `dgeqlf`/`dgeql2` leave in the LAST K columns of A (with tau in TAU). dorg2l
* CONSUMES that QL factorization: on input the (N-K+i)-th column of A holds the
* vector defining reflector H(i) (essential part ABOVE the pivot, per the QL
* convention), and on output the first N columns of A are overwritten with the
* economy Q = H(K)...H(1) applied to the trailing N columns of I_M.
*
* The oracles are INDEPENDENT of the reflector algebra:
*   (a) the columns of Q are orthonormal (QᴴQ = I), and
*   (b) the economy reconstruction A0 = Q · L holds, where Q is the M x N factor
*       org forms and L is the BOTTOM N x N lower-triangular block of the factored
*       A (QL stores L where (i-j) >= (M-N); its trailing N x N block is N x N lower
*       triangular). Derivation: Q_econ = (H(K)...H(1))·[0;I_N] and A0 =
*       (H(K)...H(1))·[0;L_bottom] = Q_econ·L_bottom. Exact for any general A at
*       every (M,N).
*
* dorg2l is the UNBLOCKED kernel (dlarf -> dgemv/dger); the storage col<->row flip
* legitimately reorders those sums, so layout invariance is asserted bit-exact only
* WITHIN a storage-order family (col / row) and cross-order correctness is certified
* by the property sweep over all layouts.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dorg2l from './../lib/ndarray.js';
import dgeqlf from '../../dgeqlf/lib/ndarray.js';

var sc = S.real; // d-routine
var BLOCKED = false; // dorg2l is the UNBLOCKED kernel (dlarf only)
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32; // geqlf hardcoded block size (governs the geqlf WORK length only)
var ROUTINE = 'dorg2l';
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// (M,N) sweep with M >= N (QL economy factor): squares from SIZES (incl. the LARGE
// 48/63/64/65/100) + tall rectangulars + degenerate corners. K = N.
var PAIRS = [];
SIZES.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
} );
[ [ 5, 3 ], [ 8, 4 ], [ 16, 7 ], [ 33, 17 ], [ 48, 20 ], [ 65, 40 ], [ 100, 33 ], [ 4, 1 ], [ 33, 32 ], [ 48, 33 ], [ 64, 32 ], [ 80, 33 ], [ 3, 0 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
} );

var ALL_LAYOUTS = schemes.dense.layouts();
var TAU_LAYOUTS = schemes.vectorLayouts();
var WORK_LAYOUTS = BLOCKED ?
	[ { 'stride': 1, 'lead': 0, 'tail': 0 }, { 'stride': 1, 'lead': 3, 'tail': 2 }, { 'stride': 1, 'lead': 1, 'tail': 0 }, { 'stride': 1, 'lead': 5, 'tail': 4 } ] :
	schemes.vectorLayouts().filter( function pos( L ) {
		return L.stride > 0;
	} );


// HELPERS //

// WORK length dgeqlf needs (blocked: N*NB + NB*NB in a SEPARATE trailing segment;
// else max(1,N)).
function workLenFactor( M, N ) {
	var K = Math.min( M, N );
	return ( K > NB ) ? ( ( N * NB ) + ( NB * NB ) ) : Math.max( 1, N );
}

// WORK length the org routine needs (blocked orgql: N*NB when K>NB; else N).
function workLenOrg( M, N ) {
	var K = N; // K = N here
	if ( BLOCKED && K > NB ) {
		return N * NB;
	}
	return Math.max( 1, N );
}

function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// The economy L factor: BOTTOM N x N lower-triangular block of the factored A.
// L[r][c] = A[(M-N)+r][c] iff r >= c (QL: L lives where (i-j) >= (M-N)).
function readL( Ard, M, N ) {
	var L = new LogicalMatrix( sc, N, N );
	var r;
	var c;
	for ( c = 0; c < N; c++ ) {
		for ( r = 0; r < N; r++ ) {
			L.set( r, c, ( r >= c ) ? Ard.read( ( M - N ) + r, c ) : sc.zero );
		}
	}
	return L;
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


// Steps 2/3/5: orthonormality (QᴴQ = I) AND economy reconstruction (A0 = Q·L)
// across the (M,N) sweep and every dense storage layout, at backward-error
// tolerance (dlarf's dgemv/dger reorder across storage order; bit-exactness is
// deferred to the layout-invariance test below).
test( ROUTINE+': QᴴQ = I and A = Q*L ((M,N) sweep x all layouts)', function t() {
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

			// Factor: A <- reflectors + L.
			dgeqlf( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wf.data, Wf.args[ 0 ], Wf.args[ 1 ] );

			// Save the economy L (bottom N x N) BEFORE org overwrites A with Q.
			var L = readL( Ar, M, N );

			// Form Q in place: A <- Q (M x N).
			var Wo = schemes.realizeVector( sc, poison( workLenOrg( M, N ) ), TIGHT_VEC );
			dorg2l( M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo.data, Wo.args[ 0 ], Wo.args[ 1 ] );

			var Q = readFull( Ar, M, N );
			var label = ROUTINE+' M=' + M + ' N=' + N + ' layout=' + li;

			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
			} );

			var QL = ref.matmul( sc, Q, L );
			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, QL, A0, { 'label': label, 'factor': 100 } );
			} );
		} );
	} );
} );


// Step 3: layout invariance. Freeze the geqlf output (reflectors + tau) ONCE at a
// tight column-major layout, then re-realize those FIXED reflectors + tau at each
// storage layout and run ONLY org. dlarf/dgemv/dger pick their summation form from
// operand strides, so assert BIT-EXACTNESS only WITHIN a storage-order family
// (col / row); offset, leading-dim padding and stride sign are still fuzzed.
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );

test( ROUTINE+': bit-exact within storage-order family (col / row)', function t() {
	runInvariance( colLayouts, 'col' );
	runInvariance( rowLayouts, 'row' );
} );

function runInvariance( variants, fam ) {
	var MI = 40;
	var NI = 24;
	var K = NI;
	var SEED = 0xF00D;

	// Freeze the factorization once (tight col-major).
	var rng = new RNG( SEED );
	var A0 = logical.general( sc, rng, MI, NI );
	var Af = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	var Tf = schemes.realizeVector( sc, poison( NI ), TIGHT_VEC );
	var Wf = schemes.realizeVector( sc, poison( workLenFactor( MI, NI ) ), TIGHT_VEC );
	dgeqlf( MI, NI, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], Tf.data, Tf.args[ 0 ], Tf.args[ 1 ], Wf.data, Wf.args[ 0 ], Wf.args[ 1 ] );
	var Frozen = readFull( Af, MI, NI );
	var taus = [];
	var ti;
	for ( ti = 0; ti < NI; ti++ ) {
		taus.push( Tf.read( ti ) );
	}

	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var Ar = schemes.dense.realize( sc, Frozen, { 'part': 'full' }, layout );
			var Tr = schemes.realizeVector( sc, taus, TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			var Wo = schemes.realizeVector( sc, poison( workLenOrg( MI, NI ) ), WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );
			dorg2l( MI, NI, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo.data, Wo.args[ 0 ], Wo.args[ 1 ] );
			return check.flattenLogical( sc, readFull( Ar, MI, NI ) );
		}, { 'label': ROUTINE+' layout invariance ' + fam + '-major (M=' + MI + ' N=' + NI + ')' } );
	} );
}


// Step 4c: WORKSPACE conformance (plain assertion, NOT `checked`). The unblocked
// dorg2l advertises and genuinely uses WORK length N (dlarf's dgemv/dger scratch).
// Derive the advertised minimum from the wrapper's own throw boundary, then run at
// exactly that length with a POISONED WORK and require finite Q (no read-past-WORK
// NaN leak) AND orthonormality.
test( ROUTINE+': advertised WORK minimum suffices (Step 4c)', function t() {
	var M = 80;
	var N = 50;
	var K = N;
	var SEED = 0xB10C;
	var label = ROUTINE+' WORK-min M=' + M + ' N=' + N;

	// Freeze one deterministic factorization; org is then run per WORK length.
	var rng = new RNG( SEED );
	var A0 = logical.general( sc, rng, M, N );
	var Af = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
	var Tf = schemes.realizeVector( sc, poison( N ), TIGHT_VEC );
	var Wf = schemes.realizeVector( sc, poison( workLenFactor( M, N ) ), TIGHT_VEC );
	dgeqlf( M, N, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], Tf.data, Tf.args[ 0 ], Tf.args[ 1 ], Wf.data, Wf.args[ 0 ], Wf.args[ 1 ] );
	var Frozen = readFull( Af, M, N );
	var taus = [];
	var ti;
	for ( ti = 0; ti < N; ti++ ) {
		taus.push( Tf.read( ti ) );
	}

	function run( len ) {
		var Ar = schemes.dense.realize( sc, Frozen, { 'part': 'full' }, null );
		var Tr = schemes.realizeVector( sc, taus, TIGHT_VEC );
		var Wo = poisonedWork( sc, len );
		dorg2l( M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo, 1, 0 );
		return check.flattenLogical( sc, readFull( Ar, M, N ) );
	}

	var minLen = assertWorkspaceSufficient( run, {}, label );

	// And orthonormality must still hold at exactly that advertised minimum.
	var Ar = schemes.dense.realize( sc, Frozen, { 'part': 'full' }, null );
	var Tr = schemes.realizeVector( sc, taus, TIGHT_VEC );
	var Wo = poisonedWork( sc, minLen );
	dorg2l( M, N, K, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo, 1, 0 );
	check.assertOrthonormal( sc, readFull( Ar, M, N ), { 'label': label + ' (WORK=' + minLen + ') Q' } );
} );
