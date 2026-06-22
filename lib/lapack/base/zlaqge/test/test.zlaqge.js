/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqge from './../lib/zlaqge.js';


// TESTS //

test( 'zlaqge is a function', function t() {
	assert.strictEqual( typeof zlaqge, 'function', 'is a function' );
});

test( 'zlaqge has expected arity', function t() {
	assert.strictEqual( zlaqge.length, 11, 'has expected arity' );
});

test( 'zlaqge throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlaqge( -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, 2, 2, 2 );
	}, RangeError );
});

test( 'zlaqge throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlaqge( new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, 2, 1, 2, 1, 2, 2, 2 );
	}, RangeError );
});
