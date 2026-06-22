/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zspsv from './../lib/ndarray.js';

// FIXTURES //

import _3x3_upper from './fixtures/3x3_upper.json' with { type: 'json' };
import _3x3_lower from './fixtures/3x3_lower.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import _4x4_lower from './fixtures/4x4_lower.json' with { type: 'json' };

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

test( 'zspsv: 3x3 upper triangle', function t() {
	var info;
	var IPIV;
	var view;
	var tc;
	var AP;
	var B;

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
	B = new Complex128Array([
		7.0,
		2.0,
		10.0,
		-1.5,
		10.0,
		2.0
	]);
	info = zspsv( 'upper', 3, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-13, 'x' );
});

test( 'zspsv: 3x3 lower triangle', function t() {
	var info;
	var IPIV;
	var view;
	var tc;
	var AP;
	var B;

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
	B = new Complex128Array([
		7.0,
		2.0,
		10.0,
		-1.5,
		10.0,
		2.0
	]);
	info = zspsv( 'lower', 3, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-13, 'x' );
});

test( 'zspsv: multiple right-hand sides', function t() {
	var info;
	var IPIV;
	var view;
	var tc;
	var AP;
	var B;

	tc = multi_rhs;
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
	B = new Complex128Array([
		7.0,
		2.0,
		10.0,
		-1.5,
		10.0,
		2.0,
		0.0,
		1.0,
		3.0,
		3.5,
		-5.0,
		-1.0
	]);
	info = zspsv( 'upper', 3, 2, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-13, 'x' );
});

test( 'zspsv: singular matrix', function t() {
	var info;
	var IPIV;
	var AP;
	var B;

	AP = new Complex128Array( 6 );
	IPIV = new Int32Array( 3 );
	B = new Complex128Array([
		1.0, 0.0, 2.0, 0.0, 3.0, 0.0
	]);
	info = zspsv( 'upper', 3, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 3, 0 );
	assert.ok( info > 0, 'info > 0 for singular matrix' );
});

test( 'zspsv: N=0 quick return', function t() {
	var info;
	var IPIV;
	var tc;
	var AP;
	var B;

	tc = n_zero;
	AP = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Complex128Array( 1 );
	info = zspsv( 'upper', 0, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zspsv: N=1', function t() {
	var info;
	var IPIV;
	var view;
	var tc;
	var AP;
	var B;

	tc = n_one;
	AP = new Complex128Array([ 5.0, 2.0 ]);
	IPIV = new Int32Array( 1 );
	B = new Complex128Array([ 10.0, 4.0 ]);
	info = zspsv( 'upper', 1, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-14, 'x' );
});

test( 'zspsv: 4x4 lower indefinite', function t() {
	var info;
	var IPIV;
	var view;
	var tc;
	var AP;
	var Bv;
	var B;

	tc = _4x4_lower;
	AP = new Complex128Array([
		2.0,
		1.0,
		1.0,
		-1.0,
		0.5,
		2.0,
		3.0,
		0.5,
		0.0,
		0.0,
		4.0,
		1.0,
		5.0,
		-2.0,
		-1.0,
		0.5,
		6.0,
		1.0,
		2.0,
		-1.0
	]);
	IPIV = new Int32Array( 4 );
	B = new Complex128Array( 4 );
	Bv = reinterpret( B, 0 );
	Bv[ 0 ] = ( 2*1 - 1*1 ) + ( 1*2 - (-1)*(-1) ) + ( 0.5*(-1) - 2*0 ) + ( 3*0 - 0.5*1 ); // eslint-disable-line max-len
	Bv[ 1 ] = ( 2*1 + 1*1 ) + ( 1*(-1) + (-1)*2 ) + ( 0.5*0 + 2*(-1) ) + ( 3*1 + 0.5*0 ); // eslint-disable-line max-len
	Bv[ 2 ] = ( 1*1 - (-1)*1 ) + ( 0*2 - 0*(-1) ) + ( 4*(-1) - 1*0 ) + ( 5*0 - (-2)*1 ); // eslint-disable-line max-len
	Bv[ 3 ] = ( 1*1 + (-1)*1 ) + ( 0*(-1) + 0*2 ) + ( 4*0 + 1*(-1) ) + ( 5*1 + (-2)*0 ); // eslint-disable-line max-len
	Bv[ 4 ] = ( 0.5*1 - 2*1 ) + ( 4*2 - 1*(-1) ) + ( (-1)*(-1) - 0.5*0 ) + ( 6*0 - 1*1 ); // eslint-disable-line max-len
	Bv[ 5 ] = ( 0.5*1 + 2*1 ) + ( 4*(-1) + 1*2 ) + ( (-1)*0 + 0.5*(-1) ) + ( 6*1 + 1*0 ); // eslint-disable-line max-len
	Bv[ 6 ] = ( 3*1 - 0.5*1 ) + ( 5*2 - (-2)*(-1) ) + ( 6*(-1) - 1*0 ) + ( 2*0 - (-1)*1 ); // eslint-disable-line max-len
	Bv[ 7 ] = ( 3*1 + 0.5*1 ) + ( 5*(-1) + (-2)*2 ) + ( 6*0 + 1*(-1) ) + ( 2*1 + (-1)*0 ); // eslint-disable-line max-len
	info = zspsv( 'lower', 4, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 4, 0 );
	view = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( view ), tc.x, 1e-13, 'x' );
});
