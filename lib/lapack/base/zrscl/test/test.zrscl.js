/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zrscl from './../lib/zrscl.js';


// TESTS //

test( 'zrscl is a function', function t() {
	assert.strictEqual( typeof zrscl, 'function', 'is a function' );
});

test( 'zrscl has expected arity', function t() {
	assert.strictEqual( zrscl.length, 4, 'has expected arity' );
});

test( 'zrscl throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zrscl( -1, 2, 2, 1 );
	}, RangeError );
});
