/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dasum from './../lib/dasum.js';


// TESTS //

test( 'dasum is a function', function t() {
	assert.strictEqual( typeof dasum, 'function', 'is a function' );
});

test( 'dasum has expected arity', function t() {
	assert.strictEqual( dasum.length, 3, 'has expected arity' );
});

test( 'dasum throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dasum( -1, 2, 1 );
	}, RangeError );
});
