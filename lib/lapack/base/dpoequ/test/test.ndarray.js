/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpoequ from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import diagonal_varied from './fixtures/diagonal_varied.json' with { type: 'json' };
import non_positive_diag from './fixtures/non_positive_diag.json' with { type: 'json' };
import zero_diag from './fixtures/zero_diag.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };

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

test( 'dpoequ: basic', function t() {
	var result;
	var tc;
	var A;
	var s;

	tc = basic;
	A = new Float64Array([ 4.0, 1.0, 0.5, 1.0, 9.0, 1.0, 0.5, 1.0, 16.0 ]);
	s = new Float64Array( 3 );
	result = dpoequ( 3, A, 1, 3, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dpoequ: diagonal_varied', function t() {
	var result;
	var tc;
	var A;
	var s;

	tc = diagonal_varied;
	A = new Float64Array([ 100.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.25 ]);
	s = new Float64Array( 3 );
	result = dpoequ( 3, A, 1, 3, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dpoequ: non_positive_diag', function t() {
	var result;
	var tc;
	var A;
	var s;

	tc = non_positive_diag;
	A = new Float64Array([ 4.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 9.0 ]);
	s = new Float64Array( 3 );
	result = dpoequ( 3, A, 1, 3, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'dpoequ: zero_diag', function t() {
	var result;
	var tc;
	var A;
	var s;

	tc = zero_diag;
	A = new Float64Array([ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 9.0 ]);
	s = new Float64Array( 3 );
	result = dpoequ( 3, A, 1, 3, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'dpoequ: n_zero', function t() {
	var result;
	var tc;
	var A;
	var s;

	tc = n_zero;
	A = new Float64Array( 1 );
	s = new Float64Array( 1 );
	result = dpoequ( 0, A, 1, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dpoequ: n_one', function t() {
	var result;
	var tc;
	var A;
	var s;

	tc = n_one;
	A = new Float64Array([ 25.0 ]);
	s = new Float64Array( 1 );
	result = dpoequ( 1, A, 1, 1, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});

test( 'dpoequ: identity', function t() {
	var result;
	var tc;
	var A;
	var s;

	tc = identity;
	A = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
	s = new Float64Array( 3 );
	result = dpoequ( 3, A, 1, 3, 0, s, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.scond, tc.scond, 1e-14, 'scond' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
	assertArrayClose( toArray( s ), tc.s, 1e-14, 's' );
});
