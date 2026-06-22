/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqsy from './../lib/zlaqsy.js';


// TESTS //

test( 'zlaqsy is a function', function t() {
	assert.strictEqual( typeof zlaqsy, 'function', 'is a function' );
});

test( 'zlaqsy has expected arity', function t() {
	assert.strictEqual( zlaqsy.length, 8, 'has expected arity' );
});

test( 'zlaqsy throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlaqsy( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 2 );
	}, TypeError );
});

test( 'zlaqsy throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlaqsy( 'upper', -1, new Float64Array( 4 ), 2, 2, 1, 2, 2 );
	}, RangeError );
});
