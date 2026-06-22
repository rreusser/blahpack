/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartv from './../lib/dlartv.js';


// TESTS //

test( 'dlartv is a function', function t() {
	assert.strictEqual( typeof dlartv, 'function', 'is a function' );
});

test( 'dlartv has expected arity', function t() {
	assert.strictEqual( dlartv.length, 8, 'has expected arity' );
});

test( 'dlartv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlartv( -1, 2, 1, 2, 1, 2, 2, 1 );
	}, RangeError );
});
