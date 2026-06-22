/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorgqr from './../lib/dorgqr.js';


// TESTS //

test( 'dorgqr is a function', function t() {
	assert.strictEqual( typeof dorgqr, 'function', 'is a function' );
});

test( 'dorgqr has expected arity', function t() {
	assert.strictEqual( dorgqr.length, 10, 'has expected arity' );
});

test( 'dorgqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorgqr( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dorgqr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorgqr( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorgqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorgqr( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorgqr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dorgqr( 'row-major', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
