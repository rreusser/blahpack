/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqsy from './../lib/ndarray.js';

// FIXTURES //

import upper_equilibrate from './fixtures/upper_equilibrate.json' with { type: 'json' };
import lower_equilibrate from './fixtures/lower_equilibrate.json' with { type: 'json' };
import no_equilibrate from './fixtures/no_equilibrate.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import small_amax from './fixtures/small_amax.json' with { type: 'json' };

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

test( 'dlaqsy: upper_equilibrate', function t() {

	const tc = upper_equilibrate;
	const A = new Float64Array([ 4.0, 0.0, 0.0, 1.0, 9.0, 0.0, 0.5, 2.0, 16.0 ]);
	const s = new Float64Array([ 0.5, 1.0/3.0, 0.25 ]);
	const equed = dlaqsy( 'upper', 3, A, 1, 3, 0, s, 1, 0, 0.05, 16.0 );
	assert.equal( equed, tc.equed, 'equed' );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlaqsy: lower_equilibrate', function t() {

	const tc = lower_equilibrate;
	const A = new Float64Array([ 4.0, 1.0, 0.5, 0.0, 9.0, 2.0, 0.0, 0.0, 16.0 ]);
	const s = new Float64Array([ 0.5, 1.0/3.0, 0.25 ]);
	const equed = dlaqsy( 'lower', 3, A, 1, 3, 0, s, 1, 0, 0.05, 16.0 );
	assert.equal( equed, tc.equed, 'equed' );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlaqsy: no_equilibrate', function t() {

	const tc = no_equilibrate;
	const A = new Float64Array([ 4.0, 1.0, 0.5, 1.0, 9.0, 2.0, 0.5, 2.0, 16.0 ]);
	const s = new Float64Array([ 1.0, 1.0, 1.0 ]);
	const equed = dlaqsy( 'upper', 3, A, 1, 3, 0, s, 1, 0, 0.5, 16.0 );
	assert.equal( equed, tc.equed, 'equed' );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlaqsy: n_zero', function t() {

	const tc = n_zero;
	const A = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const equed = dlaqsy( 'upper', 0, A, 1, 1, 0, s, 1, 0, 1.0, 1.0 );
	assert.equal( equed, tc.equed, 'equed' );
});

test( 'dlaqsy: n_one_upper', function t() {

	const tc = n_one_upper;
	const A = new Float64Array([ 100.0 ]);
	const s = new Float64Array([ 0.1 ]);
	const equed = dlaqsy( 'upper', 1, A, 1, 1, 0, s, 1, 0, 0.01, 100.0 );
	assert.equal( equed, tc.equed, 'equed' );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});

test( 'dlaqsy: small_amax', function t() {

	const tc = small_amax;
	const A = new Float64Array([ 1e-300, 0.0, 0.0, 1e-300 ]);
	const s = new Float64Array([ 1e150, 1e150 ]);
	const equed = dlaqsy( 'upper', 2, A, 1, 2, 0, s, 1, 0, 1.0, 1e-300 );
	assert.equal( equed, tc.equed, 'equed' );
	assertArrayClose( toArray( A ), tc.a, 1e-14, 'a' );
});
