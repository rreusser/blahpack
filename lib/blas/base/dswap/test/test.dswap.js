/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dswap from './../lib/dswap.js';


// TESTS //

test( 'dswap is a function', function t() {
	assert.strictEqual( typeof dswap, 'function', 'is a function' );
});

test( 'dswap has expected arity', function t() {
	assert.strictEqual( dswap.length, 5, 'has expected arity' );
});

test( 'dswap throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dswap( -1, 2, 1, 2, 1 );
	}, RangeError );
});
