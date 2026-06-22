/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlarft from './../lib/zlarft.js';


// TESTS //

test( 'zlarft is a function', function t() {
	assert.strictEqual( typeof zlarft, 'function', 'is a function' );
});

test( 'zlarft has expected arity', function t() {
	assert.strictEqual( zlarft.length, 11, 'has expected arity' );
});

test( 'zlarft throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlarft( 'invalid', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlarft throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarft( 'row-major', 2, 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlarft throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlarft( 'row-major', 2, 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
