/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpbequ from './../lib/ndarray.js';

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import non_positive_upper from './fixtures/non_positive_upper.json' with { type: 'json' };
import zero_diag_lower from './fixtures/zero_diag_lower.json' with { type: 'json' };
import identity_upper from './fixtures/identity_upper.json' with { type: 'json' };
import diagonal_varied_lower from './fixtures/diagonal_varied_lower.json' with { type: 'json' };
import non_positive_first from './fixtures/non_positive_first.json' with { type: 'json' };
import non_positive_last from './fixtures/non_positive_last.json' with { type: 'json' };

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

test( 'dpbequ is a function', function t() {
	assert.equal( typeof dpbequ, 'function' );
});

test( 'dpbequ: upper_basic', function t() {
	var result;
	var tc;
	var AB;
	var s;

	tc = upper_basic;
	AB = new Float64Array([
		0.0,
		0.0,
		4.0,   // col 1
		0.0,
		1.0,
		9.0,   // col 2
		0.5,
		2.0,
		16.0,  // col 3
		0.0,
		1.5,
		25.0   // col 4
	]);
	s = new Float64Array( 4 );
	result = dpbequ( 'upper', 4, 2, AB, 1, 3, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dpbequ: lower_basic', function t() {
	var result;
	var tc;
	var AB;
	var s;

	tc = lower_basic;
	AB = new Float64Array([
		4.0,
		1.0,
		0.5,   // col 1
		9.0,
		2.0,
		0.0,   // col 2
		16.0,
		1.5,
		0.0,  // col 3
		25.0,
		0.0,
		0.0   // col 4
	]);
	s = new Float64Array( 4 );
	result = dpbequ( 'lower', 4, 2, AB, 1, 3, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dpbequ: n_zero', function t() {
	var result;
	var tc;
	var AB;
	var s;

	tc = n_zero;
	AB = new Float64Array( 1 );
	s = new Float64Array( 1 );
	result = dpbequ( 'upper', 0, 0, AB, 1, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dpbequ: n_one', function t() {
	var result;
	var tc;
	var AB;
	var s;

	tc = n_one;
	AB = new Float64Array([ 49.0 ]);
	s = new Float64Array( 1 );
	result = dpbequ( 'upper', 1, 0, AB, 1, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dpbequ: non_positive_upper', function t() {
	var result;
	var tc;
	var AB;
	var s;

	tc = non_positive_upper;
	AB = new Float64Array([
		0.0,
		4.0,    // col 1
		1.0,
		-1.0,   // col 2
		0.5,
		9.0     // col 3
	]);
	s = new Float64Array( 3 );
	result = dpbequ( 'upper', 3, 1, AB, 1, 2, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'dpbequ: zero_diag_lower', function t() {
	var result;
	var tc;
	var AB;
	var s;

	tc = zero_diag_lower;
	AB = new Float64Array([
		4.0,
		1.0,   // col 1
		0.0,
		0.5,   // col 2
		9.0,
		0.0    // col 3
	]);
	s = new Float64Array( 3 );
	result = dpbequ( 'lower', 3, 1, AB, 1, 2, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'dpbequ: identity_upper', function t() {
	var result;
	var tc;
	var AB;
	var s;

	tc = identity_upper;
	AB = new Float64Array([
		0.0,
		1.0,   // col 1
		0.0,
		1.0,   // col 2
		0.0,
		1.0    // col 3
	]);
	s = new Float64Array( 3 );
	result = dpbequ( 'upper', 3, 1, AB, 1, 2, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dpbequ: diagonal_varied_lower', function t() {
	var result;
	var tc;
	var AB;
	var s;

	tc = diagonal_varied_lower;
	AB = new Float64Array([ 100.0, 1.0, 0.25 ]);
	s = new Float64Array( 3 );
	result = dpbequ( 'lower', 3, 0, AB, 1, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dpbequ: non_positive_first', function t() {
	var result;
	var tc;
	var AB;
	var s;

	tc = non_positive_first;
	AB = new Float64Array([ -2.0, 4.0, 9.0 ]);
	s = new Float64Array( 3 );
	result = dpbequ( 'lower', 3, 0, AB, 1, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'dpbequ: non_positive_last', function t() {
	var result;
	var tc;
	var AB;
	var s;

	tc = non_positive_last;
	AB = new Float64Array([ 4.0, 9.0, -3.0 ]);
	s = new Float64Array( 3 );
	result = dpbequ( 'upper', 3, 0, AB, 1, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});
