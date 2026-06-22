
// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsygvx from './../lib/ndarray.js';

// FIXTURES //

import itype1_v_a_l from './fixtures/itype1_v_a_l.json' with { type: 'json' };
import itype1_v_a_u from './fixtures/itype1_v_a_u.json' with { type: 'json' };
import itype1_n_a_l from './fixtures/itype1_n_a_l.json' with { type: 'json' };
import itype1_v_v_l from './fixtures/itype1_v_v_l.json' with { type: 'json' };
import itype1_v_i_l from './fixtures/itype1_v_i_l.json' with { type: 'json' };
import itype2_v_a_l from './fixtures/itype2_v_a_l.json' with { type: 'json' };
import itype3_v_a_l from './fixtures/itype3_v_a_l.json' with { type: 'json' };
import nonposdef_b from './fixtures/nonposdef_b.json' with { type: 'json' };
import itype3_v_a_u from './fixtures/itype3_v_a_u.json' with { type: 'json' };
import itype2_v_i_u from './fixtures/itype2_v_i_u.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (actual=' + actual.length + ', expected=' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* 4x4 diagonally dominant symmetric matrix A (column-major):
*   [10  1  0.5  0 ]
*   [ 1  8  0    0.5]
*   [0.5 0 12    1  ]
*   [ 0  0.5 1   6  ]
*/
function symA() {
	return new Float64Array([
		10, 1, 0.5, 0,
		1, 8, 0, 0.5,
		0.5, 0, 12, 1,
		0, 0.5, 1, 6
	]);
}

/**
* 4x4 SPD matrix B (column-major):
*   [4 1 0 0]
*   [1 5 1 0]
*   [0 1 6 1]
*   [0 0 1 3]
*/
function spdB() {
	return new Float64Array([
		4, 1, 0, 0,
		1, 5, 1, 0,
		0, 1, 6, 1,
		0, 0, 1, 3
	]);
}

/**
* Verify generalized eigenvector property for the given ITYPE.
* ITYPE=1: A*v = lambda*B*v
* ITYPE=2: A*B*v = lambda*v
* ITYPE=3: B*A*v = lambda*x
*/
function verifyGenEigenpairs( Aorig, Borig, N, itype, w, Z, M, tol, msg ) {
	var Lv;
	var Rv;
	var v;
	var i;
	var j;
	var k;
	var err;
	var nrm;

	for ( k = 0; k < M; k++ ) {
		Lv = new Float64Array( N );
		Rv = new Float64Array( N );
		v = new Float64Array( N );

		// Extract eigenvector k (column k of Z)
		for ( i = 0; i < N; i++ ) {
			v[ i ] = Z[ i + k * N ];
		}

		if ( itype === 1 ) {
			// A*v = lambda*B*v
			for ( i = 0; i < N; i++ ) {
				Lv[ i ] = 0.0;
				Rv[ i ] = 0.0;
				for ( j = 0; j < N; j++ ) {
					Lv[ i ] += Aorig[ i + j * N ] * v[ j ];
					Rv[ i ] += Borig[ i + j * N ] * v[ j ];
				}
				Rv[ i ] *= w[ k ];
			}
		} else if ( itype === 2 ) {
			// A*B*v = lambda*v
			// Compute Bv first
			var Bv = new Float64Array( N );
			for ( i = 0; i < N; i++ ) {
				Bv[ i ] = 0.0;
				for ( j = 0; j < N; j++ ) {
					Bv[ i ] += Borig[ i + j * N ] * v[ j ];
				}
			}
			for ( i = 0; i < N; i++ ) {
				Lv[ i ] = 0.0;
				for ( j = 0; j < N; j++ ) {
					Lv[ i ] += Aorig[ i + j * N ] * Bv[ j ];
				}
				Rv[ i ] = w[ k ] * v[ i ];
			}
		} else if ( itype === 3 ) {
			// B*A*v = lambda*v
			var Av = new Float64Array( N );
			for ( i = 0; i < N; i++ ) {
				Av[ i ] = 0.0;
				for ( j = 0; j < N; j++ ) {
					Av[ i ] += Aorig[ i + j * N ] * v[ j ];
				}
			}
			for ( i = 0; i < N; i++ ) {
				Lv[ i ] = 0.0;
				for ( j = 0; j < N; j++ ) {
					Lv[ i ] += Borig[ i + j * N ] * Av[ j ];
				}
				Rv[ i ] = w[ k ] * v[ i ];
			}
		}

		err = 0.0;
		nrm = 0.0;
		for ( i = 0; i < N; i++ ) {
			err += ( Lv[ i ] - Rv[ i ] ) * ( Lv[ i ] - Rv[ i ] );
			nrm += v[ i ] * v[ i ];
		}
		err = Math.sqrt( err );
		nrm = Math.sqrt( nrm );
		assert.ok( err / ( nrm * Math.max( Math.abs( w[ k ] ), 1.0 ) ) < tol, msg + ': eigenpair ' + k + ' residual too large (' + err + ')' );
	}
}

function runDsygvx( itype, jobz, range, uplo, N, A, B, vl, vu, il, iu, abstol ) {
	var WORK = new Float64Array( Math.max( 256, 8 * N + 100 ) );
	var IWORK = new Int32Array( 5 * N + 10 );
	var IFAIL = new Int32Array( N + 1 );
	var w = new Float64Array( N );
	var Z = new Float64Array( N * N );
	var out = { M: 0 };

	var info = dsygvx( itype, jobz, range, uplo, N, A, 1, N, 0, B, 1, N, 0, vl, vu, il, iu, abstol, out, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, WORK.length, IWORK, 1, 0, IFAIL, 1, 0 );
	return { info: info, M: out.M, w: w, Z: Z, IFAIL: IFAIL };
}

// TESTS //

test( 'dsygvx: ITYPE=1, JOBZ=V, RANGE=A, UPLO=L', function t() {
	var tc = itype1_v_a_l;
	var Aorig = symA();
	var Borig = spdB();
	var A = new Float64Array( Aorig );
	var B = new Float64Array( Borig );
	var r = runDsygvx( 1, 'compute-vectors', 'all', 'lower', 4, A, B, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyGenEigenpairs( Aorig, Borig, 4, 1, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsygvx: ITYPE=1, JOBZ=V, RANGE=A, UPLO=U', function t() {
	var tc = itype1_v_a_u;
	var Aorig = symA();
	var Borig = spdB();
	var A = new Float64Array( Aorig );
	var B = new Float64Array( Borig );
	var r = runDsygvx( 1, 'compute-vectors', 'all', 'upper', 4, A, B, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyGenEigenpairs( Aorig, Borig, 4, 1, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsygvx: ITYPE=1, JOBZ=N, RANGE=A, UPLO=L', function t() {
	var tc = itype1_n_a_l;
	var A = symA();
	var B = spdB();
	var r = runDsygvx( 1, 'no-vectors', 'all', 'lower', 4, A, B, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'dsygvx: ITYPE=1, JOBZ=V, RANGE=V, UPLO=L (value range [1.5, 2.5])', function t() {
	var tc = itype1_v_v_l;
	var Aorig = symA();
	var Borig = spdB();
	var A = new Float64Array( Aorig );
	var B = new Float64Array( Borig );
	var r = runDsygvx( 1, 'compute-vectors', 'value', 'lower', 4, A, B, 1.5, 2.5, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyGenEigenpairs( Aorig, Borig, 4, 1, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsygvx: ITYPE=1, JOBZ=V, RANGE=I, UPLO=L (index 2..3)', function t() {
	var tc = itype1_v_i_l;
	var Aorig = symA();
	var Borig = spdB();
	var A = new Float64Array( Aorig );
	var B = new Float64Array( Borig );
	var r = runDsygvx( 1, 'compute-vectors', 'index', 'lower', 4, A, B, 0, 0, 2, 3, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	verifyGenEigenpairs( Aorig, Borig, 4, 1, r.w, r.Z, r.M, 1e-12, 'eigenpairs' );
});

test( 'dsygvx: ITYPE=2, JOBZ=V, RANGE=A, UPLO=L', function t() {
	var tc = itype2_v_a_l;
	var Aorig = symA();
	var Borig = spdB();
	var A = new Float64Array( Aorig );
	var B = new Float64Array( Borig );
	var r = runDsygvx( 2, 'compute-vectors', 'all', 'lower', 4, A, B, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-12, 'w' );
	verifyGenEigenpairs( Aorig, Borig, 4, 2, r.w, r.Z, r.M, 1e-10, 'eigenpairs' );
});

test( 'dsygvx: ITYPE=3, JOBZ=V, RANGE=A, UPLO=L', function t() {
	var tc = itype3_v_a_l;
	var Aorig = symA();
	var Borig = spdB();
	var A = new Float64Array( Aorig );
	var B = new Float64Array( Borig );
	var r = runDsygvx( 3, 'compute-vectors', 'all', 'lower', 4, A, B, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-12, 'w' );
	verifyGenEigenpairs( Aorig, Borig, 4, 3, r.w, r.Z, r.M, 1e-10, 'eigenpairs' );
});

test( 'dsygvx: N=0 quick return', function t() {
	var A = new Float64Array( 1 );
	var B = new Float64Array( 1 );
	var r = runDsygvx( 1, 'compute-vectors', 'all', 'lower', 0, A, B, 0, 0, 0, 0, 0 );

	assert.equal( r.info, 0 );
	assert.equal( r.M, 0 );
});

test( 'dsygvx: non-positive-definite B returns INFO > N', function t() {
	var tc = nonposdef_b;
	// 3x3 symmetric A
	var A = new Float64Array([
		2, 1, 0,
		1, 3, 1,
		0, 1, 2
	]);
	// Non-positive-definite B
	var B = new Float64Array([
		1, 2, 0,
		2, 1, 0,
		0, 0, 1
	]);
	var r = runDsygvx( 1, 'compute-vectors', 'all', 'lower', 3, A, B, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.ok( r.info > 3, 'info should be > N for non-posdef B' );
});

test( 'dsygvx: ITYPE=3, JOBZ=V, RANGE=A, UPLO=U', function t() {
	var tc = itype3_v_a_u;
	var Aorig = symA();
	var Borig = spdB();
	var A = new Float64Array( Aorig );
	var B = new Float64Array( Borig );
	var r = runDsygvx( 3, 'compute-vectors', 'all', 'upper', 4, A, B, 0, 0, 0, 0, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-12, 'w' );
	verifyGenEigenpairs( Aorig, Borig, 4, 3, r.w, r.Z, r.M, 1e-10, 'eigenpairs' );
});

test( 'dsygvx: ITYPE=2, JOBZ=V, RANGE=I, UPLO=U (index 1..2)', function t() {
	var tc = itype2_v_i_u;
	var Aorig = symA();
	var Borig = spdB();
	var A = new Float64Array( Aorig );
	var B = new Float64Array( Borig );
	var r = runDsygvx( 2, 'compute-vectors', 'index', 'upper', 4, A, B, 0, 0, 1, 2, 0 );

	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( Array.prototype.slice.call( r.w, 0, r.M ), tc.w, 1e-12, 'w' );
	verifyGenEigenpairs( Aorig, Borig, 4, 2, r.w, r.Z, r.M, 1e-10, 'eigenpairs' );
});
