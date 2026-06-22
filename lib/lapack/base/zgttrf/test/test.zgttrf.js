/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgttrf from './../lib/zgttrf.js';


// TESTS //

test( 'zgttrf is a function', function t() {
	assert.strictEqual( typeof zgttrf, 'function', 'is a function' );
});

test( 'zgttrf has expected arity', function t() {
	assert.strictEqual( zgttrf.length, 2, 'has expected arity' );
});
