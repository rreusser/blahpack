/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorghr from './../lib/dorghr.js';


// TESTS //

test( 'dorghr is a function', function t() {
	assert.strictEqual( typeof dorghr, 'function', 'is a function' );
});

test( 'dorghr has expected arity', function t() {
	assert.strictEqual( dorghr.length, 10, 'has expected arity' );
});

test( 'dorghr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorghr( -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
