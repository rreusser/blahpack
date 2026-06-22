/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines-per-function */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrevc from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'ztrevc.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Returns a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case data
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts two numbers are close.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are element-wise close.
*
* @private
* @param {Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Creates a Complex128Array from interleaved Float64 data.
*
* @private
* @param {Array} data - interleaved real/imag values
* @returns {Complex128Array} complex array
*/
function makeComplex( data ) {
	var view;
	var arr;
	var i;
	arr = new Complex128Array( data.length / 2 );
	view = reinterpret( arr, 0 );
	for ( i = 0; i < data.length; i++ ) {
		view[ i ] = data[ i ];
	}
	return arr;
}

/**
* Creates a 3x3 upper triangular test matrix T.
*
* @private
* @returns {Complex128Array} 3x3 upper triangular matrix in column-major
*/
function makeT3() {
	// Col 0: (2+i, 0, 0); Col 1: (1+0.5i, 3-i, 0); Col 2: (0.5-0.5i, 1+i, 4+0.5i)
	return makeComplex([
		2,
		1,
		0,
		0,
		0,
		0,
		1,
		0.5,
		3,
		-1,
		0,
		0,
		0.5,
		-0.5,
		1,
		1,
		4,
		0.5
	]);
}

/**
* Creates a 4x4 upper triangular test matrix T.
*
* @private
* @returns {Complex128Array} 4x4 upper triangular matrix in column-major
*/
function makeT4() {
	return makeComplex([
		1,
		0.5,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		-1,
		3,
		1,
		0,
		0,
		0,
		0,
		0.5,
		0.5,
		1,
		-0.5,
		2,
		-1,
		0,
		0,
		1,
		0,
		0.5,
		1,
		1.5,
		0,
		4,
		0
	]);
}

/**
* Converts a Float64 view to a plain array.
*
* @private
* @param {Float64Array} view - Float64 view
* @returns {Array} plain array
*/
function toArray( view ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < view.length; i++ ) {
		out.push( view[ i ] );
	}
	return out;
}


// TESTS //

test( 'ztrevc: right_all_3x3', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var VR;
	var VL;
	var T;

	tc = findCase( 'right_all_3x3' );
	T = makeT3();
	VR = new Complex128Array( 9 );
	VL = new Complex128Array( 9 );
	WORK = new Complex128Array( 6 );
	RWORK = new Float64Array( 3 );
	info = ztrevc( 'right', 'all', new Uint8Array( 3 ), 1, 0, 3, T, 1, 3, 0, VL, 1, 3, 0, VR, 1, 3, 0, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( VR, 0 ) ), tc.VR, 1e-12, 'VR' );
});

test( 'ztrevc: left_all_3x3', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var VR;
	var VL;
	var T;

	tc = findCase( 'left_all_3x3' );
	T = makeT3();
	VR = new Complex128Array( 9 );
	VL = new Complex128Array( 9 );
	WORK = new Complex128Array( 6 );
	RWORK = new Float64Array( 3 );
	info = ztrevc( 'left', 'all', new Uint8Array( 3 ), 1, 0, 3, T, 1, 3, 0, VL, 1, 3, 0, VR, 1, 3, 0, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( VL, 0 ) ), tc.VL, 1e-12, 'VL' );
});

test( 'ztrevc: both_all_3x3', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var VR;
	var VL;
	var T;

	tc = findCase( 'both_all_3x3' );
	T = makeT3();
	VR = new Complex128Array( 9 );
	VL = new Complex128Array( 9 );
	WORK = new Complex128Array( 6 );
	RWORK = new Float64Array( 3 );
	info = ztrevc( 'both', 'all', new Uint8Array( 3 ), 1, 0, 3, T, 1, 3, 0, VL, 1, 3, 0, VR, 1, 3, 0, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( VR, 0 ) ), tc.VR, 1e-12, 'VR' );
	assertArrayClose( toArray( reinterpret( VL, 0 ) ), tc.VL, 1e-12, 'VL' );
});

test( 'ztrevc: right_selected_3x3', function t() {
	var SELECT;
	var RWORK;
	var WORK;
	var info;
	var tc;
	var VR;
	var VL;
	var T;

	tc = findCase( 'right_selected_3x3' );
	T = makeT3();
	SELECT = new Uint8Array( [ 1, 0, 1 ] );
	VR = new Complex128Array( 6 );
	VL = new Complex128Array( 1 );
	WORK = new Complex128Array( 6 );
	RWORK = new Float64Array( 3 );
	info = ztrevc( 'right', 'selected', SELECT, 1, 0, 3, T, 1, 3, 0, VL, 1, 1, 0, VR, 1, 3, 0, 2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( VR, 0 ) ), tc.VR, 1e-12, 'VR' );
});

test( 'ztrevc: right_backtransform_3x3', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var VR;
	var VL;
	var T;

	tc = findCase( 'right_backtransform_3x3' );
	T = makeT3();
	VL = new Complex128Array( 9 );
	VR = makeComplex([
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		0
	]);
	WORK = new Complex128Array( 6 );
	RWORK = new Float64Array( 3 );
	info = ztrevc( 'right', 'backtransform', new Uint8Array( 3 ), 1, 0, 3, T, 1, 3, 0, VL, 1, 3, 0, VR, 1, 3, 0, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( VR, 0 ) ), tc.VR, 1e-12, 'VR' );
});

test( 'ztrevc: both_all_1x1', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var VR;
	var VL;
	var T;

	tc = findCase( 'both_all_1x1' );
	T = makeComplex( [ 5, 2 ] );
	VR = new Complex128Array( 1 );
	VL = new Complex128Array( 1 );
	WORK = new Complex128Array( 2 );
	RWORK = new Float64Array( 1 );
	info = ztrevc( 'both', 'all', new Uint8Array( 1 ), 1, 0, 1, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( VR, 0 ) ), tc.VR, 1e-12, 'VR' );
	assertArrayClose( toArray( reinterpret( VL, 0 ) ), tc.VL, 1e-12, 'VL' );
});

test( 'ztrevc: both_all_4x4', function t() {
	var RWORK;
	var WORK;
	var info;
	var tc;
	var VR;
	var VL;
	var T;

	tc = findCase( 'both_all_4x4' );
	T = makeT4();
	VR = new Complex128Array( 16 );
	VL = new Complex128Array( 16 );
	WORK = new Complex128Array( 8 );
	RWORK = new Float64Array( 4 );
	info = ztrevc( 'both', 'all', new Uint8Array( 4 ), 1, 0, 4, T, 1, 4, 0, VL, 1, 4, 0, VR, 1, 4, 0, 4, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( VR, 0 ) ), tc.VR, 1e-12, 'VR' );
	assertArrayClose( toArray( reinterpret( VL, 0 ) ), tc.VL, 1e-12, 'VL' );
});

test( 'ztrevc: left_selected_4x4', function t() {
	var SELECT;
	var RWORK;
	var WORK;
	var info;
	var tc;
	var VR;
	var VL;
	var T;

	tc = findCase( 'left_selected_4x4' );
	T = makeT4();
	SELECT = new Uint8Array( [ 0, 1, 0, 1 ] );
	VR = new Complex128Array( 1 );
	VL = new Complex128Array( 8 );
	WORK = new Complex128Array( 8 );
	RWORK = new Float64Array( 4 );
	info = ztrevc( 'left', 'selected', SELECT, 1, 0, 4, T, 1, 4, 0, VL, 1, 4, 0, VR, 1, 1, 0, 2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( VL, 0 ) ), tc.VL, 1e-12, 'VL' );
});
