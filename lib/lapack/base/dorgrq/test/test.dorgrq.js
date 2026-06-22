/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorgrq from './../lib/dorgrq.js';


// TESTS //

test( 'dorgrq is a function', function t() {
	assert.strictEqual( typeof dorgrq, 'function', 'is a function' );
});

test( 'dorgrq has expected arity', function t() {
	assert.strictEqual( dorgrq.length, 10, 'has expected arity' );
});

test( 'dorgrq throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorgrq( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dorgrq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorgrq( 'row-major', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorgrq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorgrq( 'row-major', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dorgrq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dorgrq( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
