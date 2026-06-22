/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zcopy from './../lib/zcopy.js';


// TESTS //

test( 'zcopy is a function', function t() {
	assert.strictEqual( typeof zcopy, 'function', 'is a function' );
});

test( 'zcopy has expected arity', function t() {
	assert.strictEqual( zcopy.length, 5, 'has expected arity' );
});

test( 'zcopy throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zcopy( -1, 2, 1, 2, 1 );
	}, RangeError );
});
