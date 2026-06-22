/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpteqr from './../lib/zpteqr.js';


// TESTS //

test( 'zpteqr is a function', function t() {
	assert.strictEqual( typeof zpteqr, 'function', 'is a function' );
});

test( 'zpteqr has expected arity', function t() {
	assert.strictEqual( zpteqr.length, 11, 'has expected arity' );
});

test( 'zpteqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zpteqr( 'invalid', 2, new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zpteqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpteqr( 'row-major', 2, -1, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
