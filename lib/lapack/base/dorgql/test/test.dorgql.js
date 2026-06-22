/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorgql from './../lib/dorgql.js';


// TESTS //

test( 'dorgql is a function', function t() {
	assert.strictEqual( typeof dorgql, 'function', 'is a function' );
});

test( 'dorgql has expected arity', function t() {
	assert.strictEqual( dorgql.length, 10, 'has expected arity' );
});

test( 'dorgql throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorgql( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dorgql throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorgql( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorgql throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorgql( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorgql throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dorgql( 'row-major', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
