/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zscal from './../lib/zscal.js';


// TESTS //

test( 'zscal is a function', function t() {
	assert.strictEqual( typeof zscal, 'function', 'is a function' );
});

test( 'zscal has expected arity', function t() {
	assert.strictEqual( zscal.length, 4, 'has expected arity' );
});

test( 'zscal throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zscal( -1, 2, 2, 1 );
	}, RangeError );
});
