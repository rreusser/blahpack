/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpptrf from './../lib/zpptrf.js';


// TESTS //

test( 'zpptrf is a function', function t() {
	assert.strictEqual( typeof zpptrf, 'function', 'is a function' );
});

test( 'zpptrf has expected arity', function t() {
	assert.strictEqual( zpptrf.length, 3, 'has expected arity' );
});

test( 'zpptrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpptrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zpptrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpptrf( 'upper', -1, new Float64Array( 4 ) );
	}, RangeError );
});
