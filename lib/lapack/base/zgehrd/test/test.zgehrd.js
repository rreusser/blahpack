/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgehrd from './../lib/zgehrd.js';


// TESTS //

test( 'zgehrd is a function', function t() {
	assert.strictEqual( typeof zgehrd, 'function', 'is a function' );
});

test( 'zgehrd has expected arity', function t() {
	assert.strictEqual( zgehrd.length, 13, 'has expected arity' );
});

test( 'zgehrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgehrd( -1, 2, 2, new Float64Array( 4 ), 1, 1, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
