/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpptri from './../lib/zpptri.js';


// TESTS //

test( 'zpptri is a function', function t() {
	assert.strictEqual( typeof zpptri, 'function', 'is a function' );
});

test( 'zpptri has expected arity', function t() {
	assert.strictEqual( zpptri.length, 3, 'has expected arity' );
});

test( 'zpptri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpptri( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zpptri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpptri( 'upper', -1, new Float64Array( 4 ) );
	}, RangeError );
});
