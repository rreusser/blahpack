/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dppequ from './../lib/ndarray.js';

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

test( 'dppequ is a function', function t() {
	assert.equal( typeof dppequ, 'function' );
});

test( 'dppequ: upper_basic', function t() {
	var result;
	var tc;
	var ap;
	var s;

	tc = upper_basic;
	ap = new Float64Array( [ 4.0, 1.0, 9.0, 0.5, 2.0, 16.0, 0.3, 1.5, 3.0, 25.0 ] ); // eslint-disable-line max-len
	s = new Float64Array( 4 );
	result = dppequ( 'upper', 4, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dppequ: lower_basic', function t() {
	var result;
	var tc;
	var ap;
	var s;

	tc = lower_basic;
	ap = new Float64Array( [ 4.0, 1.0, 0.5, 0.3, 9.0, 2.0, 1.5, 16.0, 3.0, 25.0 ] ); // eslint-disable-line max-len
	s = new Float64Array( 4 );
	result = dppequ( 'lower', 4, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dppequ: n_zero', function t() {
	var result;
	var tc;
	var ap;
	var s;

	tc = n_zero;
	ap = new Float64Array( 1 );
	s = new Float64Array( 1 );
	result = dppequ( 'upper', 0, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dppequ: n_one', function t() {
	var result;
	var tc;
	var ap;
	var s;

	tc = n_one;
	ap = new Float64Array( [ 49.0 ] );
	s = new Float64Array( 1 );
	result = dppequ( 'upper', 1, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dppequ: non_positive_upper', function t() {
	var result;
	var tc;
	var ap;
	var s;

	tc = non_positive_upper;
	ap = new Float64Array( [ 4.0, 1.0, -1.0, 0.5, 2.0, 9.0 ] );
	s = new Float64Array( 3 );
	result = dppequ( 'upper', 3, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'dppequ: zero_diag_lower', function t() {
	var result;
	var tc;
	var ap;
	var s;

	tc = zero_diag_lower;
	ap = new Float64Array( [ 4.0, 1.0, 0.5, 0.0, 2.0, 9.0 ] );
	s = new Float64Array( 3 );
	result = dppequ( 'lower', 3, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'dppequ: identity_upper', function t() {
	var result;
	var tc;
	var ap;
	var s;

	tc = identity_upper;
	ap = new Float64Array( [ 1.0, 0.0, 1.0, 0.0, 0.0, 1.0 ] );
	s = new Float64Array( 3 );
	result = dppequ( 'upper', 3, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dppequ: diagonal_varied_lower', function t() {
	var result;
	var tc;
	var ap;
	var s;

	tc = diagonal_varied_lower;
	ap = new Float64Array( [ 100.0, 5.0, 2.0, 1.0, 0.1, 0.25 ] );
	s = new Float64Array( 3 );
	result = dppequ( 'lower', 3, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dppequ: non_positive_first', function t() {
	var result;
	var tc;
	var ap;
	var s;

	tc = non_positive_first;
	ap = new Float64Array( [ -2.0, 1.0, 0.5, 4.0, 2.0, 9.0 ] );
	s = new Float64Array( 3 );
	result = dppequ( 'lower', 3, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'dppequ: non_positive_last', function t() {
	var result;
	var tc;
	var ap;
	var s;

	tc = non_positive_last;
	ap = new Float64Array( [ 4.0, 1.0, 9.0, 0.5, 2.0, -3.0 ] );
	s = new Float64Array( 3 );
	result = dppequ( 'upper', 3, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'dppequ: non-unit stride for s', function t() {
	var result;
	var ap;
	var s;

	ap = new Float64Array( [ 4.0, 1.0, 9.0, 0.5, 2.0, 16.0 ] );
	s = new Float64Array( 6 );
	result = dppequ( 'upper', 3, ap, 1, 0, s, 2, 0 );
	assert.equal( result.info, 0, 'info' );
	assertClose( s[ 0 ], 1.0 / Math.sqrt( 4.0 ), 1e-14, 's[0]' );
	assertClose( s[ 2 ], 1.0 / Math.sqrt( 9.0 ), 1e-14, 's[2]' );
	assertClose( s[ 4 ], 1.0 / Math.sqrt( 16.0 ), 1e-14, 's[4]' );
});

test( 'dppequ: offset for AP', function t() {
	var result;
	var ap;
	var s;

	ap = new Float64Array( [ 999.0, 999.0, 999.0, 25.0, 7.0, 36.0 ] );
	s = new Float64Array( 2 );
	result = dppequ( 'upper', 2, ap, 1, 3, s, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assertClose( s[ 0 ], 1.0 / Math.sqrt( 25.0 ), 1e-14, 's[0]' );
	assertClose( s[ 1 ], 1.0 / Math.sqrt( 36.0 ), 1e-14, 's[1]' );
	assertClose( result.amax, 36.0, 1e-14, 'amax' );
	assertClose( result.scond, Math.sqrt( 25.0 ) / Math.sqrt( 36.0 ), 1e-14, 'scond' ); // eslint-disable-line max-len
});

test( 'dppequ: offset for s', function t() {
	var result;
	var ap;
	var s;

	ap = new Float64Array( [ 9.0, 3.0, 16.0 ] );
	s = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	result = dppequ( 'lower', 2, ap, 1, 0, s, 1, 2 );
	assert.equal( result.info, 0, 'info' );
	assertClose( s[ 2 ], 1.0 / Math.sqrt( 9.0 ), 1e-14, 's[2]' );
	assertClose( s[ 3 ], 1.0 / Math.sqrt( 16.0 ), 1e-14, 's[3]' );
});

test( 'dppequ: N=1 lower', function t() {
	var result;
	var ap;
	var s;

	ap = new Float64Array( [ 25.0 ] );
	s = new Float64Array( 1 );
	result = dppequ( 'lower', 1, ap, 1, 0, s, 1, 0 );
	assert.equal( result.info, 0, 'info' );
	assertClose( s[ 0 ], 1.0 / Math.sqrt( 25.0 ), 1e-14, 's[0]' );
	assertClose( result.scond, 1.0, 1e-14, 'scond' );
	assertClose( result.amax, 25.0, 1e-14, 'amax' );
});
