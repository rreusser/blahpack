/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zpttrf from './../lib/zpttrf.js';


// TESTS //

test( 'zpttrf is a function', function t() {
	assert.strictEqual( typeof zpttrf, 'function', 'is a function' );
});

test( 'zpttrf has expected arity', function t() {
	assert.strictEqual( zpttrf.length, 5, 'has expected arity' );
});

test( 'zpttrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpttrf( -1, 2, 1, 2, 1 );
	}, RangeError );
});
