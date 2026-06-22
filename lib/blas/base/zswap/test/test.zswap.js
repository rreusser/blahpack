/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zswap from './../lib/zswap.js';


// TESTS //

test( 'zswap is a function', function t() {
	assert.strictEqual( typeof zswap, 'function', 'is a function' );
});

test( 'zswap has expected arity', function t() {
	assert.strictEqual( zswap.length, 5, 'has expected arity' );
});

test( 'zswap throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zswap( -1, 2, 1, 2, 1 );
	}, RangeError );
});
