/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dzasum from './../lib/dzasum.js';


// TESTS //

test( 'dzasum is a function', function t() {
	assert.strictEqual( typeof dzasum, 'function', 'is a function' );
});

test( 'dzasum has expected arity', function t() {
	assert.strictEqual( dzasum.length, 4, 'has expected arity' );
});

test( 'dzasum throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dzasum( -1, 2, 1, 2 );
	}, RangeError );
});
