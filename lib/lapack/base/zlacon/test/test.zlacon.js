/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlacon from './../lib/zlacon.js';


// TESTS //

test( 'zlacon is a function', function t() {
	assert.strictEqual( typeof zlacon, 'function', 'is a function' );
});

test( 'zlacon has expected arity', function t() {
	assert.strictEqual( zlacon.length, 7, 'has expected arity' );
});

test( 'zlacon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlacon( -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
