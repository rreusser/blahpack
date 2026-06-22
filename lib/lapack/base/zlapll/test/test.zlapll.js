/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlapll from './../lib/zlapll.js';


// TESTS //

test( 'zlapll is a function', function t() {
	assert.strictEqual( typeof zlapll, 'function', 'is a function' );
});

test( 'zlapll has expected arity', function t() {
	assert.strictEqual( zlapll.length, 6, 'has expected arity' );
});

test( 'zlapll throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlapll( -1, 2, 1, 2, 1, 2 );
	}, RangeError );
});
