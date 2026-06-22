/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zaxpy from './../lib/zaxpy.js';


// TESTS //

test( 'zaxpy is a function', function t() {
	assert.strictEqual( typeof zaxpy, 'function', 'is a function' );
});

test( 'zaxpy has expected arity', function t() {
	assert.strictEqual( zaxpy.length, 6, 'has expected arity' );
});

test( 'zaxpy throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zaxpy( -1, 2, 2, 1, 2, 1 );
	}, RangeError );
});
