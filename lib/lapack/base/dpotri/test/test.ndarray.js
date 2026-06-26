// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dpotri from './../lib/ndarray.js';
var ndarray = dpotri;

// FIXTURES //

import upper_3x3_chol from './fixtures/upper_3x3_chol.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_3x3_chol from './fixtures/lower_3x3_chol.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import dpotrf from '../../dpotrf/lib/base.js';

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Symmetric matrix-matrix multiply: C = A * B where A is symmetric stored
* in either the upper or lower triangle.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'` (which triangle of A is stored)
* @param {NonNegativeInteger} N - order
* @param {Float64Array} A - symmetric matrix (column-major, only uplo triangle meaningful)
* @param {Float64Array} B - full N x N matrix (column-major)
* @returns {Float64Array} C - result N x N matrix (column-major)
*/
function symmMul( uplo, N, A, B ) {
	var C = new Float64Array( N * N );
	var aij;
	var i;
	var j;
	var k;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			for ( k = 0; k < N; k++ ) {
				// Read A(i,k) from the stored triangle
				if ( uplo === 'upper' ) {
					aij = ( i <= k ) ? A[ i + k * N ] : A[ k + i * N ];
				} else {
					aij = ( i >= k ) ? A[ i + k * N ] : A[ k + i * N ];
				}
				C[ i + j * N ] += aij * B[ k + j * N ];
			}
		}
	}
	return C;
}

/**
* Verify C is approximately the identity matrix.
*
* @private
* @param {Float64Array} C - N x N column-major matrix
* @param {NonNegativeInteger} N - order
* @param {number} tol - tolerance
* @param {string} label - test label
*/
function assertIdentity( C, N, tol, label ) {
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			if ( i === j ) {
				assertClose( C[ i + j * N ], 1.0, tol, label + ' I[' + i + ',' + j + ']' );
			} else {
				assert.ok( Math.abs( C[ i + j * N ] ) < tol, label + ' I[' + i + ',' + j + '] should be ~0, got ' + C[ i + j * N ] );
			}
		}
	}
}

// TESTS //

test( 'dpotri: UPLO=U, 3x3 SPD matrix', function t() {
	var tc_chol = upper_3x3_chol;
	var tc = upper_3x3;
	var A = new Float64Array( tc_chol.chol );
	var origA;
	var info;
	var C;

	info = dpotri( 'upper', 3, A, 1, 3, 0 );

	assert.equal( info, tc.info, 'info should be 0' );

	// Compare upper triangle against fixture
	assertClose( A[0], tc.a[0], 1e-14, 'a[0,0]' );
	assertClose( A[3], tc.a[3], 1e-14, 'a[0,1]' );
	assertClose( A[4], tc.a[4], 1e-14, 'a[1,1]' );
	assertClose( A[6], tc.a[6], 1e-14, 'a[0,2]' );
	assertClose( A[7], tc.a[7], 1e-14, 'a[1,2]' );
	assertClose( A[8], tc.a[8], 1e-14, 'a[2,2]' );

	// Verify mathematical property: original_A * A_inv ≈ I
	// Original A = [4 2 1; 2 5 3; 1 3 6]
	origA = new Float64Array([
		4, 2, 1,
		2, 5, 3,
		1, 3, 6
	]);
	C = symmMul( 'upper', 3, A, origA );
	assertIdentity( C, 3, 1e-13, 'upper_3x3' );
});

test( 'dpotri: UPLO=L, 3x3 SPD matrix', function t() {
	var tc_chol = lower_3x3_chol;
	var tc = lower_3x3;
	var A = new Float64Array( tc_chol.chol );
	var origA;
	var info;
	var C;

	info = dpotri( 'lower', 3, A, 1, 3, 0 );

	assert.equal( info, tc.info, 'info should be 0' );

	// Compare lower triangle against fixture
	assertClose( A[0], tc.a[0], 1e-14, 'a[0,0]' );
	assertClose( A[1], tc.a[1], 1e-14, 'a[1,0]' );
	assertClose( A[2], tc.a[2], 1e-14, 'a[2,0]' );
	assertClose( A[4], tc.a[4], 1e-14, 'a[1,1]' );
	assertClose( A[5], tc.a[5], 1e-14, 'a[2,1]' );
	assertClose( A[8], tc.a[8], 1e-14, 'a[2,2]' );

	// Verify mathematical property: original_A * A_inv ≈ I
	origA = new Float64Array([
		4, 2, 1,
		2, 5, 3,
		1, 3, 6
	]);
	C = symmMul( 'lower', 3, A, origA );
	assertIdentity( C, 3, 1e-13, 'lower_3x3' );
});

test( 'dpotri: N=1 edge case', function t() {
	var tc = n_one;
	// A = [9], dpotrf gives [3], dpotri gives [1/9]
	var A = new Float64Array( [ 3.0 ] );
	var info;

	info = dpotri( 'upper', 1, A, 1, 1, 0 );

	assert.equal( info, tc.info, 'info should be 0' );
	assertClose( A[0], tc.a[0], 1e-14, 'a[0]' );
});

test( 'dpotri: N=0 quick return', function t() {
	var tc = n_zero;
	var A = new Float64Array( [ 999.0 ] );
	var info;

	info = dpotri( 'upper', 0, A, 1, 1, 0 );

	assert.equal( info, tc.info, 'info should be 0' );
	assert.equal( A[0], 999.0, 'A should be untouched' );
});

test( 'dpotri: UPLO=U, 4x4 SPD matrix', function t() {
	var tc = upper_4x4;
	var origA;
	var info;
	var A;
	var C;

	// Original: A = [10 1 2 3; 1 10 1 2; 2 1 10 1; 3 2 1 10]
	A = new Float64Array([
		10, 1, 2, 3,
		1, 10, 1, 2,
		2, 1, 10, 1,
		3, 2, 1, 10
	]);
	origA = new Float64Array( A );

	info = dpotrf( 'upper', 4, A, 1, 4, 0 );
	assert.equal( info, 0, 'dpotrf should succeed' );

	info = dpotri( 'upper', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info, 'dpotri info should be 0' );

	// Compare upper triangle against fixture
	assertClose( A[0],  tc.a[0],  1e-14, 'a[0,0]' );
	assertClose( A[4],  tc.a[4],  1e-14, 'a[0,1]' );
	assertClose( A[5],  tc.a[5],  1e-14, 'a[1,1]' );
	assertClose( A[8],  tc.a[8],  1e-14, 'a[0,2]' );
	assertClose( A[9],  tc.a[9],  1e-14, 'a[1,2]' );
	assertClose( A[10], tc.a[10], 1e-14, 'a[2,2]' );
	assertClose( A[12], tc.a[12], 1e-14, 'a[0,3]' );
	assertClose( A[13], tc.a[13], 1e-14, 'a[1,3]' );
	assertClose( A[14], tc.a[14], 1e-14, 'a[2,3]' );
	assertClose( A[15], tc.a[15], 1e-14, 'a[3,3]' );

	// Verify mathematical property
	C = symmMul( 'upper', 4, A, origA );
	assertIdentity( C, 4, 1e-12, 'upper_4x4' );
});

test( 'dpotri: UPLO=L, 4x4 SPD matrix', function t() {
	var tc = lower_4x4;
	var origA;
	var info;
	var A;
	var C;

	A = new Float64Array([
		10, 1, 2, 3,
		1, 10, 1, 2,
		2, 1, 10, 1,
		3, 2, 1, 10
	]);
	origA = new Float64Array( A );

	info = dpotrf( 'lower', 4, A, 1, 4, 0 );
	assert.equal( info, 0, 'dpotrf should succeed' );

	info = dpotri( 'lower', 4, A, 1, 4, 0 );
	assert.equal( info, tc.info, 'dpotri info should be 0' );

	// Compare lower triangle against fixture
	assertClose( A[0],  tc.a[0],  1e-14, 'a[0,0]' );
	assertClose( A[1],  tc.a[1],  1e-14, 'a[1,0]' );
	assertClose( A[2],  tc.a[2],  1e-14, 'a[2,0]' );
	assertClose( A[3],  tc.a[3],  1e-14, 'a[3,0]' );
	assertClose( A[5],  tc.a[5],  1e-14, 'a[1,1]' );
	assertClose( A[6],  tc.a[6],  1e-14, 'a[2,1]' );
	assertClose( A[7],  tc.a[7],  1e-14, 'a[3,1]' );
	assertClose( A[10], tc.a[10], 1e-14, 'a[2,2]' );
	assertClose( A[11], tc.a[11], 1e-14, 'a[3,2]' );
	assertClose( A[15], tc.a[15], 1e-14, 'a[3,3]' );

	// Verify mathematical property
	C = symmMul( 'lower', 4, A, origA );
	assertIdentity( C, 4, 1e-12, 'lower_4x4' );
});

test( 'dpotri: singular matrix returns info > 0', function t() {
	// Create a Cholesky factor with a zero diagonal element
	var A = new Float64Array([
		2, 0, 0,
		1, 0, 0,   // zero diagonal at (1,1)
		3, 5, 6
	]);
	var info;

	info = dpotri( 'upper', 3, A, 1, 3, 0 );

	// dtrtri should detect the zero diagonal and return info=2
	assert.ok( info > 0, 'info should be > 0 for singular matrix' );
});

test( 'dpotri: non-zero offset', function t() {
	var offset = 4;
	var origA;
	var invA;
	var info;
	var A;
	var C;
	var i;

	A = new Float64Array( 13 );

	// Place a 3x3 SPD matrix starting at offset 4
	// A = [4 2 1; 2 5 3; 1 3 6], column-major
	A[ offset + 0 ] = 4; A[ offset + 3 ] = 2; A[ offset + 6 ] = 1;
	A[ offset + 1 ] = 2; A[ offset + 4 ] = 5; A[ offset + 7 ] = 3;
	A[ offset + 2 ] = 1; A[ offset + 5 ] = 3; A[ offset + 8 ] = 6;

	origA = new Float64Array([
		4, 2, 1,
		2, 5, 3,
		1, 3, 6
	]);

	info = dpotrf( 'upper', 3, A, 1, 3, offset );
	assert.equal( info, 0, 'dpotrf should succeed' );

	info = dpotri( 'upper', 3, A, 1, 3, offset );
	assert.equal( info, 0, 'dpotri should succeed' );

	// Verify A_inv * A ≈ I using upper triangle
	invA = new Float64Array( 9 );
	for ( i = 0; i < 9; i++ ) {
		invA[ i ] = A[ offset + i ];
	}
	C = symmMul( 'upper', 3, invA, origA );
	assertIdentity( C, 3, 1e-13, 'offset' );
});

// ndarray validation tests

test( 'dpotri: ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function() {
		ndarray( 'invalid', 3, new Float64Array( 9 ), 1, 3, 0 );
	}, TypeError );
});

test( 'dpotri: ndarray throws RangeError for negative N', function t() {
	assert.throws( function() {
		ndarray( 'upper', -1, new Float64Array( 9 ), 1, 3, 0 );
	}, RangeError );
});
