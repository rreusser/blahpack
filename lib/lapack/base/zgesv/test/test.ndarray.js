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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
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
	let are, aim, xre, xim;
	const b = new Float64Array( 2 * N * nrhs );
	let i, j, k;
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zgesv: solve_3x3', function t() {
	let Borig;

	const tc = solve_3x3;
	const A = new Complex128Array([
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
	const Aorig = new Float64Array( reinterpret( A, 0 ) );
	const B = new Complex128Array( 3 );
	Borig = reinterpret( B, 0 );
	const bview = zmatmat( Aorig, new Float64Array( [ 1, 0, 1, 0, 1, 0 ] ), 3, 1 );
	Borig.set( bview );
	Borig = new Float64Array( Borig );
	const IPIV = new Int32Array( 3 );
	const info = zgesv( 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	const view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-13, 'x' );
	const AB = zmatmat( Aorig, toArray( view ), 3, 1 );
	assertArrayClose( toArray( AB ), toArray( Borig ), 1e-13, 'A*x=b' );
});

test( 'zgesv: multi_rhs', function t() {

	const tc = multi_rhs;
	const A = new Complex128Array([
		3.0,
		1.0,
		2.0,
		0.5,
		1.0,
		-1.0,
		5.0,
		2.0
	]);
	const Aorig = new Float64Array( reinterpret( A, 0 ) );
	const IPIV = new Int32Array( 2 );
	const B = new Complex128Array([
		3.0,
		1.0,
		2.0,
		0.5,
		0.0,
		2.0,
		4.5,
		4.0
	]);
	const Borig = new Float64Array( reinterpret( B, 0 ) );
	const info = zgesv( 2, 2, A, 1, 2, 0, IPIV, 1, 0, B, 1, 2, 0 );
	const view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-13, 'x' );
	const AB = zmatmat( Aorig, toArray( view ), 2, 2 );
	assertArrayClose( toArray( AB ), toArray( Borig ), 1e-13, 'A*X=B' );
});

test( 'zgesv: singular', function t() {

	const tc = singular;
	const A = new Complex128Array([
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
	const IPIV = new Int32Array( 3 );
	const B = new Complex128Array([
		1.0, 0.0, 2.0, 0.0, 3.0, 0.0
	]);
	const info = zgesv( 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.ok( info > 0, 'info > 0 for singular matrix' );
});

test( 'zgesv: n_zero', function t() {

	const tc = n_zero;
	const A = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Complex128Array( 1 );
	const info = zgesv( 0, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zgesv: nrhs_zero', function t() {

	const tc = nrhs_zero;
	const A = new Complex128Array( [ 5.0, 1.0 ] );
	const IPIV = new Int32Array( 1 );
	const B = new Complex128Array( 1 );
	const info = zgesv( 1, 0, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zgesv: 1x1', function t() {

	const tc = _1x1;
	const A = new Complex128Array( [ 5.0, 2.0 ] );
	const IPIV = new Int32Array( 1 );
	const B = new Complex128Array( [ 10.0, 4.0 ] );
	const info = zgesv( 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	const view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-14, 'x' );
});

test( 'zgesv: 4x4', function t() {

	const tc = _4x4;
	const A = new Complex128Array([
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
	const Aorig = new Float64Array( reinterpret( A, 0 ) );
	const IPIV = new Int32Array( 4 );
	const xvec = new Float64Array([
		1.0, 1.0, 2.0, -1.0, -1.0, 2.0, 3.0, 0.0
	]);
	const bvals = zmatmat( Aorig, xvec, 4, 1 );
	const B = new Complex128Array( 4 );
	reinterpret( B, 0 ).set( bvals );
	const Borig = new Float64Array( reinterpret( B, 0 ) );
	const info = zgesv( 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	const view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-13, 'x' );
	const AB = zmatmat( Aorig, toArray( view ), 4, 1 );
	assertArrayClose( toArray( AB ), toArray( Borig ), 1e-13, 'A*x=b' );
});
