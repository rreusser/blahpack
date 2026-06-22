/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlange from './../lib/zlange.js';


// TESTS //

test( 'zlange is a function', function t() {
	assert.strictEqual( typeof zlange, 'function', 'is a function' );
});

test( 'zlange has expected arity', function t() {
	assert.strictEqual( zlange.length, 8, 'has expected arity' );
});

test( 'zlange throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlange( 'invalid', 'max', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlange throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlange( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlange throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlange( 'row-major', 'max', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zlange throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlange( 'row-major', 'max', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
