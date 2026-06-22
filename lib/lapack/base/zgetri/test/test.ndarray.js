/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgetrf from '../../zgetrf/lib/base.js';
import zgetri from './../lib/ndarray.js';

// FIXTURES //

import _3x3_inverse from './fixtures/3x3_inverse.json' with { type: 'json' };
import _4x4_inverse from './fixtures/4x4_inverse.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import _3x3_pivots_inverse from './fixtures/3x3_pivots_inverse.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Complex matrix multiply C = A * B (column-major, N-by-N).
*/
function zmatmul( N, Av, Bv ) {
	var Cv = new Float64Array( 2 * N * N );
	var ar;
	var ai;
	var br;
	var bi;
	var i;
	var j;
	var k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			for ( k = 0; k < N; k++ ) {
				ar = Av[ 2 * ( i + k * N ) ];
				ai = Av[ 2 * ( i + k * N ) + 1 ];
				br = Bv[ 2 * ( k + j * N ) ];
				bi = Bv[ 2 * ( k + j * N ) + 1 ];

				// (ar + ai*i) * (br + bi*i) = (ar*br - ai*bi) + (ar*bi + ai*br)*i
				Cv[ 2 * ( i + j * N ) ] += ar * br - ai * bi;
				Cv[ 2 * ( i + j * N ) + 1 ] += ar * bi + ai * br;
			}
		}
	}
	return Cv;
}

/**
* Assert that a complex matrix is approximately the identity.
*/
function assertComplexIdentity( N, Cv, tol, msg ) {
	var expectedR;
	var expectedI;
	var errR;
	var errI;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			expectedR = ( i === j ) ? 1.0 : 0.0;
			expectedI = 0.0;
			errR = Math.abs( Cv[ 2 * ( i + j * N ) ] - expectedR );
			errI = Math.abs( Cv[ 2 * ( i + j * N ) + 1 ] - expectedI );
			assert.ok( errR <= tol, msg + ': C[' + i + ',' + j + '] real = ' + Cv[ 2 * ( i + j * N ) ] + ', expected ' + expectedR + ', err = ' + errR ); // eslint-disable-line max-len
			assert.ok( errI <= tol, msg + ': C[' + i + ',' + j + '] imag = ' + Cv[ 2 * ( i + j * N ) + 1 ] + ', expected ' + expectedI + ', err = ' + errI ); // eslint-disable-line max-len
		}
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zgetri: 3x3 inverse', function t() {
	var Aorig;
	var IPIV;
	var WORK;
	var info;
	var view;
	var tc;
	var A;
	var C;

	tc = _3x3_inverse;
	Aorig = new Complex128Array([
		2,
		1,
		4,
		2,
		8,
		0,
		1,
		0,
		3,
		1,
		7,
		1,
		1,
		0.5,
		3,
		0,
		9,
		2
	]);
	A = new Complex128Array( toArray( reinterpret( Aorig, 0 ) ) );
	IPIV = new Int32Array( 3 );
	WORK = new Complex128Array( 64 );
	info = zgetrf( 3, 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'zgetrf info' );
	info = zgetri( 3, A, 1, 3, 0, IPIV, 1, 0, WORK, 1, 0, 64 );
	assert.equal( info, tc.info, 'zgetri info' );
	view = reinterpret( A, 0 );
	assertArrayClose( toArray( view ), tc.a, 1e-13, 'a' );
	C = zmatmul( 3, reinterpret( Aorig, 0 ), view );
	assertComplexIdentity( 3, C, 1e-13, 'A * A_inv' );
});

test( 'zgetri: 4x4 inverse', function t() {
	var Aorig;
	var IPIV;
	var WORK;
	var info;
	var view;
	var tc;
	var A;
	var C;

	tc = _4x4_inverse;
	Aorig = new Complex128Array([
		5,
		1,
		1,
		0.5,
		0.5,
		0,
		0,
		0.5,
		1,
		-0.5,
		5,
		2,
		1,
		1,
		0.5,
		0,
		0.5,
		0,
		1,
		-1,
		5,
		0,
		1,
		0.5,
		0,
		-0.5,
		0.5,
		0,
		1,
		-0.5,
		5,
		1
	]);
	A = new Complex128Array( toArray( reinterpret( Aorig, 0 ) ) );
	IPIV = new Int32Array( 4 );
	WORK = new Complex128Array( 128 );
	info = zgetrf( 4, 4, A, 1, 4, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'zgetrf info' );
	info = zgetri( 4, A, 1, 4, 0, IPIV, 1, 0, WORK, 1, 0, 128 );
	assert.equal( info, tc.info, 'zgetri info' );
	view = reinterpret( A, 0 );
	assertArrayClose( toArray( view ), tc.a, 1e-13, 'a' );
	C = zmatmul( 4, reinterpret( Aorig, 0 ), view );
	assertComplexIdentity( 4, C, 1e-13, 'A * A_inv' );
});

test( 'zgetri: N=1 edge case', function t() {
	var IPIV;
	var WORK;
	var info;
	var view;
	var tc;
	var A;

	tc = n1;
	A = new Complex128Array( [ 3, 4 ] );
	IPIV = new Int32Array( 1 );
	WORK = new Complex128Array( 4 );
	info = zgetrf( 1, 1, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'zgetrf info' );
	info = zgetri( 1, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0, 4 );
	assert.equal( info, tc.info, 'zgetri info' );
	view = reinterpret( A, 0 );
	assertArrayClose( toArray( view ), tc.a, 1e-14, 'a' );
});

test( 'zgetri: N=0 quick return', function t() {
	var IPIV;
	var WORK;
	var info;
	var A;

	A = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zgetri( 0, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0, 1 );
	assert.equal( info, 0, 'info should be 0' );
});

test( 'zgetri: 3x3 different pivots', function t() {
	var Aorig;
	var IPIV;
	var WORK;
	var info;
	var view;
	var tc;
	var A;
	var C;

	tc = _3x3_pivots_inverse;
	Aorig = new Complex128Array([
		1,
		0,
		4,
		1,
		7,
		2,
		2,
		1,
		5,
		0,
		8,
		1,
		3,
		0,
		6,
		2,
		0,
		1
	]);
	A = new Complex128Array( toArray( reinterpret( Aorig, 0 ) ) );
	IPIV = new Int32Array( 3 );
	WORK = new Complex128Array( 64 );
	info = zgetrf( 3, 3, A, 1, 3, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'zgetrf info' );
	info = zgetri( 3, A, 1, 3, 0, IPIV, 1, 0, WORK, 1, 0, 64 );
	assert.equal( info, tc.info, 'zgetri info' );
	view = reinterpret( A, 0 );
	assertArrayClose( toArray( view ), tc.a, 1e-13, 'a' );
	C = zmatmul( 3, reinterpret( Aorig, 0 ), view );
	assertComplexIdentity( 3, C, 1e-13, 'A * A_inv' );
});

test( 'zgetri: singular matrix returns info > 0', function t() {
	var IPIV;
	var WORK;
	var info;
	var A;

	A = new Complex128Array( [ 1, 0, 2, 0, 2, 0, 4, 0 ] );
	IPIV = new Int32Array( 2 );
	WORK = new Complex128Array( 16 );
	info = zgetrf( 2, 2, A, 1, 2, 0, IPIV, 1, 0 );
	assert.ok( info > 0, 'zgetrf should detect singular matrix, info=' + info );
	info = zgetri( 2, A, 1, 2, 0, IPIV, 1, 0, WORK, 1, 0, 16 );
	assert.ok( info > 0, 'zgetri should return info > 0 for singular matrix, info=' + info ); // eslint-disable-line max-len
});

test( 'zgetri: 5x5 matrix inverse (diagonally dominant)', function t() {
	var Aorig;
	var data;
	var IPIV;
	var WORK;
	var info;
	var N;
	var i;
	var j;
	var A;
	var C;

	N = 5;
	data = new Float64Array( 2 * N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				data[ 2 * ( i + j * N ) ] = N + 1.0;
				data[ 2 * ( i + j * N ) + 1 ] = 1.0;
			} else {
				data[ 2 * ( i + j * N ) ] = 1.0 / ( 1.0 + Math.abs( i - j ) );
				data[ 2 * ( i + j * N ) + 1 ] = 0.5 / ( 1.0 + Math.abs( i - j ) );
			}
		}
	}
	Aorig = new Complex128Array( data.buffer.slice( 0 ) );
	A = new Complex128Array( toArray( data ) );
	IPIV = new Int32Array( N );
	WORK = new Complex128Array( N * 64 );
	info = zgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'zgetrf info' );
	info = zgetri( N, A, 1, N, 0, IPIV, 1, 0, WORK, 1, 0, N * 64 );
	assert.equal( info, 0, 'zgetri info' );
	C = zmatmul( N, reinterpret( Aorig, 0 ), reinterpret( A, 0 ) );
	assertComplexIdentity( N, C, 1e-12, 'A * A_inv' );
});

test( 'zgetri: blocked path (large matrix, N=35)', function t() {
	var Aorig;
	var data;
	var IPIV;
	var WORK;
	var info;
	var N;
	var i;
	var j;
	var A;
	var C;

	N = 35;
	data = new Float64Array( 2 * N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				data[ 2 * ( i + j * N ) ] = N + 1.0;
				data[ 2 * ( i + j * N ) + 1 ] = 1.0;
			} else {
				data[ 2 * ( i + j * N ) ] = 1.0 / ( 1.0 + Math.abs( i - j ) );
				data[ 2 * ( i + j * N ) + 1 ] = 0.5 / ( 1.0 + Math.abs( i - j ) );
			}
		}
	}
	Aorig = new Complex128Array( data.buffer.slice( 0 ) );
	A = new Complex128Array( toArray( data ) );
	IPIV = new Int32Array( N );
	WORK = new Complex128Array( N * 64 );
	info = zgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'zgetrf info' );
	info = zgetri( N, A, 1, N, 0, IPIV, 1, 0, WORK, 1, 0, N * 64 );
	assert.equal( info, 0, 'zgetri info' );
	C = zmatmul( N, reinterpret( Aorig, 0 ), reinterpret( A, 0 ) );
	assertComplexIdentity( N, C, 1e-10, 'A * A_inv' );
});

test( 'zgetri: blocked path with insufficient workspace', function t() {
	var Aorig;
	var lwork;
	var data;
	var IPIV;
	var WORK;
	var info;
	var N;
	var i;
	var j;
	var A;
	var C;

	N = 35;
	data = new Float64Array( 2 * N * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				data[ 2 * ( i + j * N ) ] = N + 1.0;
				data[ 2 * ( i + j * N ) + 1 ] = 1.0;
			} else {
				data[ 2 * ( i + j * N ) ] = 1.0 / ( 1.0 + Math.abs( i - j ) );
				data[ 2 * ( i + j * N ) + 1 ] = 0.5 / ( 1.0 + Math.abs( i - j ) );
			}
		}
	}
	Aorig = new Complex128Array( data.buffer.slice( 0 ) );
	A = new Complex128Array( toArray( data ) );
	IPIV = new Int32Array( N );
	lwork = 105;
	WORK = new Complex128Array( lwork );
	info = zgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'zgetrf info' );
	info = zgetri( N, A, 1, N, 0, IPIV, 1, 0, WORK, 1, 0, lwork );
	assert.equal( info, 0, 'zgetri info' );
	C = zmatmul( N, reinterpret( Aorig, 0 ), reinterpret( A, 0 ) );
	assertComplexIdentity( N, C, 1e-10, 'A * A_inv' );
});
