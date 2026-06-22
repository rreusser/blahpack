/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarnv from './../lib/dlarnv.js';


// TESTS //

test( 'dlarnv is a function', function t() {
	assert.strictEqual( typeof dlarnv, 'function', 'is a function' );
});

test( 'dlarnv has expected arity', function t() {
	assert.strictEqual( dlarnv.length, 6, 'has expected arity' );
});

test( 'dlarnv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarnv( 2, 2, 1, -1, 2, 1 );
	}, RangeError );
});
