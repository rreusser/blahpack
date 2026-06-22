/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import drscl from './../lib/drscl.js';


// TESTS //

test( 'drscl is a function', function t() {
	assert.strictEqual( typeof drscl, 'function', 'is a function' );
});

test( 'drscl has expected arity', function t() {
	assert.strictEqual( drscl.length, 4, 'has expected arity' );
});

test( 'drscl throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		drscl( -1, 2, 2, 1 );
	}, RangeError );
});
