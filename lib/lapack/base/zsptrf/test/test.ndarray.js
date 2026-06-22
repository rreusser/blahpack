/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsptrf from './../lib/ndarray.js';

// FIXTURES //

import _3x3_upper from './fixtures/3x3_upper.json' with { type: 'json' };
import _3x3_lower from './fixtures/3x3_lower.json' with { type: 'json' };
import _4x4_indef_upper from './fixtures/4x4_indef_upper.json' with { type: 'json' };
import _4x4_indef_lower from './fixtures/4x4_indef_lower.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import _4x4_tridiag_lower from './fixtures/4x4_tridiag_lower.json' with { type: 'json' };
import _4x4_tridiag_upper from './fixtures/4x4_tridiag_upper.json' with { type: 'json' };
import n_one_singular from './fixtures/n_one_singular.json' with { type: 'json' };

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
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Convert Fortran 1-based IPIV to JS 0-based convention.
* Fortran: positive = 1-based, negative = -(1-based) for 2x2 pivot.
* JS: positive = 0-based, negative = ~(0-based) for 2x2 pivot.
*
* @private
* @param {Array} fipiv - Fortran 1-based IPIV array
* @returns {Array} JS 0-based IPIV array
*/
function convertIPIV( fipiv ) {
	var out = [];
	var i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] >= 0 ) {
			out.push( fipiv[ i ] - 1 ); // 1-based to 0-based
		} else {
			out.push( ~( (-fipiv[ i ]) - 1 ) ); // negative 1-based to ~(0-based)
		}
	}
	return out;
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

test( 'zsptrf is a function', function t() {
	assert.strictEqual( typeof zsptrf, 'function' );
});

test( 'zsptrf: 3x3_upper', function t() {
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _3x3_upper;
	AP = new Complex128Array([
		4.0,
		1.0,
		2.0,
		-1.0,
		5.0,
		0.5,
		1.0,
		2.0,
		3.0,
		-1.0,
		6.0,
		1.0
	]);
	IPIV = new Int32Array( 3 );
	info = zsptrf( 'upper', 3, AP, 1, 0, IPIV, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	assert.strictEqual( info, tc.info );
});

test( 'zsptrf: 3x3_lower', function t() {
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _3x3_lower;
	AP = new Complex128Array([
		4.0,
		1.0,
		2.0,
		-1.0,
		1.0,
		2.0,
		5.0,
		0.5,
		3.0,
		-1.0,
		6.0,
		1.0
	]);
	IPIV = new Int32Array( 3 );
	info = zsptrf( 'lower', 3, AP, 1, 0, IPIV, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	assert.strictEqual( info, tc.info );
});

test( 'zsptrf: 4x4_indef_upper', function t() {
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _4x4_indef_upper;
	AP = new Complex128Array([
		0.0,
		0.0,
		1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		-1.0,
		4.0,
		1.0,
		0.0,
		0.0,
		3.0,
		0.5,
		5.0,
		-2.0,
		6.0,
		1.0,
		0.0,
		0.0
	]);
	IPIV = new Int32Array( 4 );
	info = zsptrf( 'upper', 4, AP, 1, 0, IPIV, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	assert.strictEqual( info, tc.info );
});

test( 'zsptrf: 4x4_indef_lower', function t() {
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _4x4_indef_lower;
	AP = new Complex128Array([
		0.0,
		0.0,
		1.0,
		1.0,
		2.0,
		-1.0,
		3.0,
		0.5,
		0.0,
		0.0,
		4.0,
		1.0,
		5.0,
		-2.0,
		0.0,
		0.0,
		6.0,
		1.0,
		0.0,
		0.0
	]);
	IPIV = new Int32Array( 4 );
	info = zsptrf( 'lower', 4, AP, 1, 0, IPIV, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	assert.strictEqual( info, tc.info );
});

test( 'zsptrf: n_zero', function t() {
	var IPIV;
	var info;
	var AP;

	AP = new Complex128Array( [ 1.0, 2.0 ] );
	IPIV = new Int32Array( 0 );
	info = zsptrf( 'lower', 0, AP, 1, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zsptrf: n_one', function t() {
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = n_one;
	AP = new Complex128Array( [ 5.0, 2.0 ] );
	IPIV = new Int32Array( 1 );
	info = zsptrf( 'lower', 1, AP, 1, 0, IPIV, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	assert.strictEqual( info, tc.info );
});

test( 'zsptrf: singular', function t() {
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = singular;
	AP = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
	IPIV = new Int32Array( 2 );
	info = zsptrf( 'lower', 2, AP, 1, 0, IPIV, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	assert.strictEqual( info, tc.info );
});

test( 'zsptrf: 4x4_tridiag_lower', function t() {
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _4x4_tridiag_lower;
	AP = new Complex128Array([
		2.0,
		1.0,
		-1.0,
		0.5,
		0.0,
		0.0,
		0.0,
		0.0,
		2.0,
		-1.0,
		-1.0,
		1.0,
		0.0,
		0.0,
		2.0,
		0.5,
		-1.0,
		-0.5,
		2.0,
		1.0
	]);
	IPIV = new Int32Array( 4 );
	info = zsptrf( 'lower', 4, AP, 1, 0, IPIV, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	assert.strictEqual( info, tc.info );
});

test( 'zsptrf: 4x4_tridiag_upper', function t() {
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = _4x4_tridiag_upper;
	AP = new Complex128Array([
		2.0,
		1.0,
		-1.0,
		0.5,
		2.0,
		-1.0,
		0.0,
		0.0,
		-1.0,
		1.0,
		2.0,
		0.5,
		0.0,
		0.0,
		0.0,
		0.0,
		-1.0,
		-0.5,
		2.0,
		1.0
	]);
	IPIV = new Int32Array( 4 );
	info = zsptrf( 'upper', 4, AP, 1, 0, IPIV, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	assert.strictEqual( info, tc.info );
});

test( 'zsptrf: n_one_singular', function t() {
	var IPIV;
	var info;
	var APv;
	var tc;
	var AP;

	tc = n_one_singular;
	AP = new Complex128Array( [ 0.0, 0.0 ] );
	IPIV = new Int32Array( 1 );
	info = zsptrf( 'upper', 1, AP, 1, 0, IPIV, 1, 0 );
	APv = reinterpret( AP, 0 );
	assertArrayClose( toArray( APv ), tc.ap, 1e-14, 'ap' );
	assert.deepStrictEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	assert.strictEqual( info, tc.info );
});
