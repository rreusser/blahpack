/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhptrf from './../lib/ndarray.js';

// FIXTURES //

import _3x3_upper_hpd from './fixtures/3x3_upper_hpd.json' with { type: 'json' };
import _3x3_lower_hpd from './fixtures/3x3_lower_hpd.json' with { type: 'json' };
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
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts Fortran 1-based IPIV to 0-based JS IPIV.
* Positive values: subtract 1. Negative values: unchanged (already encodes 0-based via ~kp).
*
* @private
* @param {Array} fipiv - Fortran IPIV array
* @returns {Array} JS IPIV array
*/
function convertIPIV( fipiv ) {
	var out = [];
	var i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
			out.push( fipiv[ i ] );
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

test( 'zhptrf: 3x3_upper_hpd', function t() {
	var ipiv;
	var info;
	var tc;
	var ap;
	var av;

	tc = _3x3_upper_hpd;
	ipiv = new Int32Array( 3 );
	ap = new Complex128Array([
		4, 0, 1, 2, 5, 0, 3, -1, 2, 1, 7, 0
	]);
	av = reinterpret( ap, 0 );
	info = zhptrf( 'upper', 3, ap, 1, 0, ipiv, 1, 0 );
	assertArrayClose( toArray( av ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhptrf: 3x3_lower_hpd', function t() {
	var ipiv;
	var info;
	var tc;
	var ap;
	var av;

	tc = _3x3_lower_hpd;
	ipiv = new Int32Array( 3 );
	ap = new Complex128Array([
		4, 0, 1, -2, 3, 1, 5, 0, 2, -1, 7, 0
	]);
	av = reinterpret( ap, 0 );
	info = zhptrf( 'lower', 3, ap, 1, 0, ipiv, 1, 0 );
	assertArrayClose( toArray( av ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhptrf: 4x4_indef_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var ap;
	var av;

	tc = _4x4_indef_upper;
	ipiv = new Int32Array( 4 );
	ap = new Complex128Array([
		0, 0, 1, 1, 0, 0, 2, -1, 4, 2, 0, 0, 3, 0.5, 5, -1, 6, 1, 0, 0
	]);
	av = reinterpret( ap, 0 );
	info = zhptrf( 'upper', 4, ap, 1, 0, ipiv, 1, 0 );
	assertArrayClose( toArray( av ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhptrf: 4x4_indef_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var ap;
	var av;

	tc = _4x4_indef_lower;
	ipiv = new Int32Array( 4 );
	ap = new Complex128Array([
		0, 0, 1, -1, 2, 1, 3, -0.5, 0, 0, 4, -2, 5, 1, 0, 0, 6, -1, 0, 0
	]);
	av = reinterpret( ap, 0 );
	info = zhptrf( 'lower', 4, ap, 1, 0, ipiv, 1, 0 );
	assertArrayClose( toArray( av ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhptrf: n_zero', function t() {
	var ipiv;
	var info;
	var ap;

	ipiv = new Int32Array( 1 );
	ap = new Complex128Array( 1 );
	info = zhptrf( 'lower', 0, ap, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zhptrf: n_one', function t() {
	var ipiv;
	var info;
	var tc;
	var ap;
	var av;

	tc = n_one;
	ipiv = new Int32Array( 1 );
	ap = new Complex128Array([ 5, 0 ]);
	av = reinterpret( ap, 0 );
	info = zhptrf( 'lower', 1, ap, 1, 0, ipiv, 1, 0 );
	assertArrayClose( toArray( av ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhptrf: singular', function t() {
	var ipiv;
	var info;
	var tc;
	var ap;
	var av;

	tc = singular;
	ipiv = new Int32Array( 2 );
	ap = new Complex128Array([ 0, 0, 0, 0, 0, 0 ]);
	av = reinterpret( ap, 0 );
	info = zhptrf( 'lower', 2, ap, 1, 0, ipiv, 1, 0 );
	assertArrayClose( toArray( av ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhptrf: 4x4_tridiag_lower', function t() {
	var ipiv;
	var info;
	var tc;
	var ap;
	var av;

	tc = _4x4_tridiag_lower;
	ipiv = new Int32Array( 4 );
	ap = new Complex128Array([
		2,
		0,
		-1,
		-1,
		0,
		0,
		0,
		0,
		3,
		0,
		-1,
		-2,
		0,
		0,
		4,
		0,
		-1,
		-1,
		3,
		0
	]);
	av = reinterpret( ap, 0 );
	info = zhptrf( 'lower', 4, ap, 1, 0, ipiv, 1, 0 );
	assertArrayClose( toArray( av ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhptrf: 4x4_tridiag_upper', function t() {
	var ipiv;
	var info;
	var tc;
	var ap;
	var av;

	tc = _4x4_tridiag_upper;
	ipiv = new Int32Array( 4 );
	ap = new Complex128Array([
		2, 0, -1, 1, 3, 0, 0, 0, -1, 2, 4, 0, 0, 0, 0, 0, -1, 1, 3, 0
	]);
	av = reinterpret( ap, 0 );
	info = zhptrf( 'upper', 4, ap, 1, 0, ipiv, 1, 0 );
	assertArrayClose( toArray( av ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zhptrf: n_one_singular', function t() {
	var ipiv;
	var info;
	var tc;
	var ap;
	var av;

	tc = n_one_singular;
	ipiv = new Int32Array( 1 );
	ap = new Complex128Array([ 0, 0 ]);
	av = reinterpret( ap, 0 );
	info = zhptrf( 'upper', 1, ap, 1, 0, ipiv, 1, 0 );
	assertArrayClose( toArray( av ), tc.ap, 1e-14, 'ap' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});
