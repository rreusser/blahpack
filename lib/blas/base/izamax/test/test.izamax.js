/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import izamax from './../lib/izamax.js';


// TESTS //

test( 'izamax is a function', function t() {
	assert.strictEqual( typeof izamax, 'function', 'is a function' );
});

test( 'izamax has expected arity', function t() {
	assert.strictEqual( izamax.length, 3, 'has expected arity' );
});

test( 'izamax throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		izamax( -1, 2, 1 );
	}, RangeError );
});
