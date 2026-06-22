/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgesv from './../lib/ndarray.js';

// FIXTURES //

import solve_3x3 from './fixtures/solve_3x3.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };
import _4x4 from './fixtures/4x4.json' with { type: 'json' };

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
* Computes complex matrix-vector product b = A*x (col-major).
* All arrays are Float64 interleaved [re, im, re, im, ...].
*
* @param {Float64Array} A - N*N complex matrix (2*N*N doubles, col-major)
* @param {Float64Array} x - N complex vector (2*N doubles)
* @param {number} N - dimension
* @param {number} nrhs - number of right-hand sides
* @returns {Float64Array} b - N*nrhs complex result (2*N*nrhs doubles)
*/
function zmatmat( A, x, N, nrhs ) {
	var are;
	var aim;
	var xre;
	var xim;
	var b = new Float64Array( 2 * N * nrhs );
	var i;
	var j;
	var k;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < N; i++ ) {
			for ( k = 0; k < N; k++ ) {
				// A[i,k] col-major: index i + k*N, each complex = 2 doubles
				are = A[ 2 * ( i + k * N ) ];
				aim = A[ 2 * ( i + k * N ) + 1 ];
				xre = x[ 2 * ( k + j * N ) ];
				xim = x[ 2 * ( k + j * N ) + 1 ];

				// (are + i*aim) * (xre + i*xim)
				b[ 2 * ( i + j * N ) ] += are * xre - aim * xim;
				b[ 2 * ( i + j * N ) + 1 ] += are * xim + aim * xre;
			}
		}
	}
	return b;
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

test( 'zgesv: solve_3x3', function t() {
	var Aorig;
	var Borig;
	var bview;
	var IPIV;
	var info;
	var view;
	var tc;
	var AB;
	var A;
	var B;

	tc = solve_3x3;
	A = new Complex128Array([
		2.0,
		1.0,
		1.0,
		-1.0,
		0.5,
		0.2,
		1.0,
		0.5,
		4.0,
		2.0,
		1.0,
		-0.5,
		0.5,
		0.1,
		1.0,
		0.3,
		3.0,
		1.0
	]);
	Aorig = new Float64Array( reinterpret( A, 0 ) );
	B = new Complex128Array( 3 );
	Borig = reinterpret( B, 0 );
	bview = zmatmat( Aorig, new Float64Array( [ 1, 0, 1, 0, 1, 0 ] ), 3, 1 );
	Borig.set( bview );
	Borig = new Float64Array( Borig );
	IPIV = new Int32Array( 3 );
	info = zgesv( 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-13, 'x' );
	AB = zmatmat( Aorig, toArray( view ), 3, 1 );
	assertArrayClose( toArray( AB ), toArray( Borig ), 1e-13, 'A*x=b' );
});

test( 'zgesv: multi_rhs', function t() {
	var Aorig;
	var Borig;
	var IPIV;
	var info;
	var view;
	var tc;
	var AB;
	var A;
	var B;

	tc = multi_rhs;
	A = new Complex128Array([
		3.0,
		1.0,
		2.0,
		0.5,
		1.0,
		-1.0,
		5.0,
		2.0
	]);
	Aorig = new Float64Array( reinterpret( A, 0 ) );
	IPIV = new Int32Array( 2 );
	B = new Complex128Array([
		3.0,
		1.0,
		2.0,
		0.5,
		0.0,
		2.0,
		4.5,
		4.0
	]);
	Borig = new Float64Array( reinterpret( B, 0 ) );
	info = zgesv( 2, 2, A, 1, 2, 0, IPIV, 1, 0, B, 1, 2, 0 );
	view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-13, 'x' );
	AB = zmatmat( Aorig, toArray( view ), 2, 2 );
	assertArrayClose( toArray( AB ), toArray( Borig ), 1e-13, 'A*X=B' );
});

test( 'zgesv: singular', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = singular;
	A = new Complex128Array([
		1.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0,
		2.0,
		0.0,
		4.0,
		0.0,
		6.0,
		0.0,
		3.0,
		0.0,
		6.0,
		0.0,
		9.0,
		0.0
	]);
	IPIV = new Int32Array( 3 );
	B = new Complex128Array([
		1.0, 0.0, 2.0, 0.0, 3.0, 0.0
	]);
	info = zgesv( 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.ok( info > 0, 'info > 0 for singular matrix' );
});

test( 'zgesv: n_zero', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = n_zero;
	A = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Complex128Array( 1 );
	info = zgesv( 0, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zgesv: nrhs_zero', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var B;

	tc = nrhs_zero;
	A = new Complex128Array( [ 5.0, 1.0 ] );
	IPIV = new Int32Array( 1 );
	B = new Complex128Array( 1 );
	info = zgesv( 1, 0, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zgesv: 1x1', function t() {
	var info;
	var IPIV;
	var view;
	var tc;
	var A;
	var B;

	tc = _1x1;
	A = new Complex128Array( [ 5.0, 2.0 ] );
	IPIV = new Int32Array( 1 );
	B = new Complex128Array( [ 10.0, 4.0 ] );
	info = zgesv( 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-14, 'x' );
});

test( 'zgesv: 4x4', function t() {
	var Aorig;
	var Borig;
	var bvals;
	var IPIV;
	var info;
	var view;
	var xvec;
	var tc;
	var AB;
	var A;
	var B;

	tc = _4x4;
	A = new Complex128Array([
		10.0,
		1.0,
		1.0,
		2.0,
		2.0,
		-1.0,
		3.0,
		0.5,
		1.0,
		-1.0,
		12.0,
		2.0,
		1.0,
		3.0,
		2.0,
		-0.5,
		2.0,
		0.5,
		3.0,
		-1.0,
		15.0,
		1.0,
		1.0,
		2.0,
		1.0,
		1.0,
		2.0,
		0.5,
		3.0,
		-2.0,
		20.0,
		3.0
	]);
	Aorig = new Float64Array( reinterpret( A, 0 ) );
	IPIV = new Int32Array( 4 );
	xvec = new Float64Array([
		1.0, 1.0, 2.0, -1.0, -1.0, 2.0, 3.0, 0.0
	]);
	bvals = zmatmat( Aorig, xvec, 4, 1 );
	B = new Complex128Array( 4 );
	reinterpret( B, 0 ).set( bvals );
	Borig = new Float64Array( reinterpret( B, 0 ) );
	info = zgesv( 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-13, 'x' );
	AB = zmatmat( Aorig, toArray( view ), 4, 1 );
	assertArrayClose( toArray( AB ), toArray( Borig ), 1e-13, 'A*x=b' );
});
