/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpptrs from './../lib/zpptrs.js';


// TESTS //

test( 'zpptrs is a function', function t() {
	assert.strictEqual( typeof zpptrs, 'function', 'is a function' );
});

test( 'zpptrs has expected arity', function t() {
	assert.strictEqual( zpptrs.length, 7, 'has expected arity' );
});

test( 'zpptrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zpptrs( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpptrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpptrs( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpptrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpptrs( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zpptrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zpptrs( 'row-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});
