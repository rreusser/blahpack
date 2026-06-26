/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlacon from './../lib/dlacon.js';


// TESTS //

test( 'dlacon is a function', function t() {
	assert.strictEqual( typeof dlacon, 'function', 'is a function' );
});

test( 'dlacon has expected arity', function t() {
	assert.strictEqual( dlacon.length, 9, 'has expected arity' );
});

test( 'dlacon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlacon( -1, 2, 1, 2, 1, 1, 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
