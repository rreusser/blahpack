/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqhe from './../lib/zlaqhe.js';


// TESTS //

test( 'zlaqhe is a function', function t() {
	assert.strictEqual( typeof zlaqhe, 'function', 'is a function' );
});

test( 'zlaqhe has expected arity', function t() {
	assert.strictEqual( zlaqhe.length, 8, 'has expected arity' );
});

test( 'zlaqhe throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlaqhe( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 2 );
	}, TypeError );
});

test( 'zlaqhe throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlaqhe( 'upper', -1, new Float64Array( 4 ), 2, 2, 1, 2, 2 );
	}, RangeError );
});
