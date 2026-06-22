/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlacn2 from './../lib/dlacn2.js';


// TESTS //

test( 'dlacn2 is a function', function t() {
	assert.strictEqual( typeof dlacn2, 'function', 'is a function' );
});

test( 'dlacn2 has expected arity', function t() {
	assert.strictEqual( dlacn2.length, 11, 'has expected arity' );
});


test( 'dlacn2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlacn2( -1, 2, 1, 2, 1, 1, 1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});
