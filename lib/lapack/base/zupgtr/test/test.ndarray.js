/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhptrd from './../../zhptrd/lib/base.js';
import zupgtr from './../lib/ndarray.js';

// FIXTURES //

import zupgtr_4x4_upper from './fixtures/zupgtr_4x4_upper.json' with { type: 'json' };
import zupgtr_4x4_lower from './fixtures/zupgtr_4x4_lower.json' with { type: 'json' };
import zupgtr_1x1 from './fixtures/zupgtr_1x1.json' with { type: 'json' };
import zupgtr_0x0 from './fixtures/zupgtr_0x0.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	var denom;

	denom = Math.max( Math.abs( expected ), 1.0 );
	relErr = Math.abs( actual - expected ) / denom;
	assert.ok( relErr <= tol, msg + ': got ' + actual + ' expected ' + expected );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual value
* @param {Array} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;

	assert.equal( actual.length, expected.length, msg + ' length' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array slice to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @param {NonNegativeInteger} start - start index
* @param {NonNegativeInteger} end - end index
* @returns {Array} output array
*/
function toArray( arr, start, end ) {
	var out = [];
	var i;

	for ( i = start; i < end; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zupgtr: upper, 4x4', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var AP;
	var qv;
	var d;
	var e;
	var Q;

	tc = zupgtr_4x4_upper;

	// Upper packed Hermitian 4x4
	AP = new Complex128Array( [
		4, 0,
		1, -1, 2, 0,
		-2, 1, 0, 0, 3, 0,
		2, 0, 1, -1, -2, -1, -1, 0
	] );
	d = new Float64Array( 4 );
	e = new Float64Array( 3 );
	TAU = new Complex128Array( 3 );

	zhptrd( 'upper', 4, AP, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );

	Q = new Complex128Array( 16 );
	WORK = new Complex128Array( 16 );
	info = zupgtr( 'upper', 4, AP, 1, 0, TAU, 1, 0, Q, 1, 4, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( qv, 0, 32 ), tc.Q, 1e-13, 'Q' );
});

test( 'zupgtr: lower, 4x4', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var AP;
	var qv;
	var d;
	var e;
	var Q;

	tc = zupgtr_4x4_lower;

	// Lower packed Hermitian 4x4
	AP = new Complex128Array( [
		4, 0, 1, 1, -2, -1, 2, 0,
		2, 0, 0, 0, 1, -1,
		3, 0, -2, 1,
		-1, 0
	] );
	d = new Float64Array( 4 );
	e = new Float64Array( 3 );
	TAU = new Complex128Array( 3 );

	zhptrd( 'lower', 4, AP, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );

	Q = new Complex128Array( 16 );
	WORK = new Complex128Array( 16 );
	info = zupgtr( 'lower', 4, AP, 1, 0, TAU, 1, 0, Q, 1, 4, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( qv, 0, 32 ), tc.Q, 1e-13, 'Q' );
});

test( 'zupgtr: N=1', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var AP;
	var qv;
	var Q;

	tc = zupgtr_1x1;

	AP = new Complex128Array( [ 5, 0 ] );
	TAU = new Complex128Array( 0 );
	Q = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );

	info = zupgtr( 'upper', 1, AP, 1, 0, TAU, 1, 0, Q, 1, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
	qv = reinterpret( Q, 0 );
	assertArrayClose( toArray( qv, 0, 2 ), tc.Q, 1e-13, 'Q' );
});

test( 'zupgtr: N=0', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var AP;
	var Q;

	tc = zupgtr_0x0;

	AP = new Complex128Array( 0 );
	TAU = new Complex128Array( 0 );
	Q = new Complex128Array( 0 );
	WORK = new Complex128Array( 0 );

	info = zupgtr( 'upper', 0, AP, 1, 0, TAU, 1, 0, Q, 1, 1, 0, WORK, 1, 0 );

	assert.equal( info, tc.info );
});
