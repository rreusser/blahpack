// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zpotrf from '../../zpotrf/lib/base.js';
import zpotri from './../lib/ndarray.js';

// FIXTURES //

import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Verify A * Ainv is approximately identity by computing C = A * Ainv
* and checking that C is close to I.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {number} N - matrix order
* @param {Array} aData - original Hermitian matrix (interleaved re/im, column-major)
* @param {Array} ainvData - inverse matrix (interleaved re/im, only tri stored)
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function verifyInverse( uplo, N, aData, ainvData, tol, msg ) {
	var Ainv;
	var view;
	var A;
	var C;
	var i;
	var j;
	var cr;
	var ci;
	var expectedR;
	var expectedI;
	var idx;

	// Build full Hermitian matrices from upper/lower triangle
	A = new Complex128Array( N * N );
	Ainv = new Complex128Array( N * N );
	view = reinterpret( A, 0 );
	for ( i = 0; i < aData.length; i++ ) {
		view[ i ] = aData[ i ];
	}
	view = reinterpret( Ainv, 0 );
	for ( i = 0; i < ainvData.length; i++ ) {
		view[ i ] = ainvData[ i ];
	}

	// Fill in the other triangle (Hermitian symmetry: A(j,i) = conj(A(i,j)))
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			if ( uplo === 'upper' && j < i ) {
				// Lower triangle from upper: A(i,j) = conj(A(j,i))
				idx = 2 * ( j * N + i ); // col-major A(i, j) = offset i + j*N
				view = reinterpret( Ainv, 0 );
				var srcIdx = 2 * ( i * N + j ); // A(j, i)
				view[ idx ] = view[ srcIdx ];
				view[ idx + 1 ] = -view[ srcIdx + 1 ];
			} else if ( uplo === 'lower' && j > i ) {
				idx = 2 * ( j * N + i );
				view = reinterpret( Ainv, 0 );
				var srcIdx2 = 2 * ( i * N + j );
				view[ idx ] = view[ srcIdx2 ];
				view[ idx + 1 ] = -view[ srcIdx2 + 1 ];
			}
		}
	}

	// Compute C = A * Ainv using zgemm
	C = new Complex128Array( N * N );
	zgemm( 'no-transpose', 'no-transpose', N, N, N,
		new Complex128( 1.0, 0.0 ),
		A, 1, N, 0,
		Ainv, 1, N, 0,
		new Complex128( 0.0, 0.0 ),
		C, 1, N, 0
	);

	// Check C is approximately identity
	view = reinterpret( C, 0 );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			idx = 2 * ( j * N + i );
			cr = view[ idx ];
			ci = view[ idx + 1 ];
			expectedR = ( i === j ) ? 1.0 : 0.0;
			expectedI = 0.0;
			assertClose( cr, expectedR, tol, msg + ' C[' + i + ',' + j + '] real' );
			assertClose( ci, expectedI, tol, msg + ' C[' + i + ',' + j + '] imag' );
		}
	}
}

// TESTS //

test( 'zpotri: upper 3x3', function t() {
	var tc = upper_3x3;
	// Full Hermitian matrix A = [10 3-i 1+2i; 3+i 8 2-i; 1-2i 2+i 6]
	// Column-major layout:
	var A = new Complex128Array( [
		10, 0,   3, 1,     1, -2,
		3, -1,   8, 0,     2, 1,
		1, 2,    2, -1,    6, 0
	] );
	// Store original full Hermitian for inverse verification
	var Aorig = Array.from( reinterpret( A, 0 ) );

	var info = zpotrf( 'upper', 3, A, 1, 3, 0 );
	assert.equal( info, 0 );

	info = zpotri( 'upper', 3, A, 1, 3, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-13, 'a' );

	// Verify A * Ainv ~ I
	verifyInverse( 'upper', 3, Aorig, tc.a, 1e-12, 'upper 3x3 inverse' );
});

test( 'zpotri: lower 3x3', function t() {
	var tc = lower_3x3;
	var A = new Complex128Array( [
		10, 0,   3, 1,     1, -2,
		3, -1,   8, 0,     2, 1,
		1, 2,    2, -1,    6, 0
	] );
	var Aorig = Array.from( reinterpret( A, 0 ) );

	var info = zpotrf( 'lower', 3, A, 1, 3, 0 );
	assert.equal( info, 0 );

	info = zpotri( 'lower', 3, A, 1, 3, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-13, 'a' );

	// Verify A * Ainv ~ I
	verifyInverse( 'lower', 3, Aorig, tc.a, 1e-12, 'lower 3x3 inverse' );
});

test( 'zpotri: N=1', function t() {
	var tc = n_one;
	// A = [9]; chol = [3]; inv = [1/9]
	var A = new Complex128Array( [ 9, 0 ] );
	var info = zpotrf( 'upper', 1, A, 1, 1, 0 );
	assert.equal( info, 0 );
	info = zpotri( 'upper', 1, A, 1, 1, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-14, 'a' );
});

test( 'zpotri: N=0 quick return', function t() {
	var tc = n_zero;
	var A = new Complex128Array( 1 );
	var info = zpotri( 'upper', 0, A, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zpotri: upper 4x4', function t() {
	var tc = upper_4x4;
	// HPD matrix [14 4-2i 2+i 1-3i; 4+2i 12 3-i 2+2i; 2-i 3+i 10 1-i; 1+3i 2-2i 1+i 9]
	var A = new Complex128Array( [
		14, 0,    4, 2,     2, -1,    1, 3,
		4, -2,   12, 0,     3, 1,     2, -2,
		2, 1,     3, -1,   10, 0,     1, 1,
		1, -3,    2, 2,     1, -1,    9, 0
	] );

	var info = zpotrf( 'upper', 4, A, 1, 4, 0 );
	assert.equal( info, 0 );
	info = zpotri( 'upper', 4, A, 1, 4, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-12, 'a' );
});

test( 'zpotri: lower 4x4', function t() {
	var tc = lower_4x4;
	var A = new Complex128Array( [
		14, 0,    4, 2,     2, -1,    1, 3,
		4, -2,   12, 0,     3, 1,     2, -2,
		2, 1,     3, -1,   10, 0,     1, 1,
		1, -3,    2, 2,     1, -1,    9, 0
	] );

	var info = zpotrf( 'lower', 4, A, 1, 4, 0 );
	assert.equal( info, 0 );
	info = zpotri( 'lower', 4, A, 1, 4, 0 );
	var view = reinterpret( A, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( view ), tc.a, 1e-12, 'a' );
});

test( 'zpotri: singular matrix returns info > 0', function t() {
	// Upper triangular matrix with zero on diagonal (singular)
	var A = new Complex128Array( [
		1, 0,  0, 0,  0, 0,
		2, 1,  0, 0,  0, 0,   // A(1,1) = 0 => singular
		3, 0,  4, 1,  5, 0
	] );
	var info = zpotri( 'upper', 3, A, 1, 3, 0 );
	assert.ok( info > 0, 'should return info > 0 for singular matrix' );
	assert.equal( info, 2, 'singular at position 2' );
});
