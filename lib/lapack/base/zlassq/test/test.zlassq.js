/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlassq from './../lib/zlassq.js';


// TESTS //

test( 'zlassq is a function', function t() {
	assert.strictEqual( typeof zlassq, 'function', 'is a function' );
});

test( 'zlassq has expected arity', function t() {
	assert.strictEqual( zlassq.length, 5, 'has expected arity' );
});

test( 'zlassq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlassq( -1, 2, 1, 2, 2 );
	}, RangeError );
});
