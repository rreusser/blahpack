/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqsp from './../lib/zlaqsp.js';


// TESTS //

test( 'zlaqsp is a function', function t() {
	assert.strictEqual( typeof zlaqsp, 'function', 'is a function' );
});

test( 'zlaqsp has expected arity', function t() {
	assert.strictEqual( zlaqsp.length, 7, 'has expected arity' );
});

test( 'zlaqsp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlaqsp( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2 );
	}, TypeError );
});

test( 'zlaqsp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlaqsp( 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 2 );
	}, RangeError );
});
