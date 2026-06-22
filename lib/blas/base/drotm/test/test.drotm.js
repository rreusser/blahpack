/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import drotm from './../lib/drotm.js';


// TESTS //

test( 'drotm is a function', function t() {
	assert.strictEqual( typeof drotm, 'function', 'is a function' );
});

test( 'drotm has expected arity', function t() {
	assert.strictEqual( drotm.length, 6, 'has expected arity' );
});

test( 'drotm throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		drotm( -1, 2, 1, 2, 1, 2 );
	}, RangeError );
});
