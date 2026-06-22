/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlapll from './../lib/dlapll.js';


// TESTS //

test( 'dlapll is a function', function t() {
	assert.strictEqual( typeof dlapll, 'function', 'is a function' );
});

test( 'dlapll has expected arity', function t() {
	assert.strictEqual( dlapll.length, 6, 'has expected arity' );
});

test( 'dlapll throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlapll( -1, 2, 1, 2, 1, 2 );
	}, RangeError );
});
