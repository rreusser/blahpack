/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlacn2 from './../lib/zlacn2.js';


// TESTS //

test( 'zlacn2 is a function', function t() {
	assert.strictEqual( typeof zlacn2, 'function', 'is a function' );
});

test( 'zlacn2 has expected arity', function t() {
	assert.strictEqual( zlacn2.length, 9, 'has expected arity' );
});

test( 'zlacn2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlacn2( -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});
