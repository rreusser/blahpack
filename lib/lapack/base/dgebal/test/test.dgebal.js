/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgebal from './../lib/dgebal.js';


// TESTS //

test( 'dgebal is a function', function t() {
	assert.strictEqual( typeof dgebal, 'function', 'is a function' );
});

test( 'dgebal has expected arity', function t() {
	assert.strictEqual( dgebal.length, 7, 'has expected arity' );
});

test( 'dgebal throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgebal( 'column-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
