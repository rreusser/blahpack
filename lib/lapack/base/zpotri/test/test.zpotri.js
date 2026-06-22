/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpotri from './../lib/zpotri.js';


// TESTS //

test( 'zpotri is a function', function t() {
	assert.strictEqual( typeof zpotri, 'function', 'is a function' );
});

test( 'zpotri has expected arity', function t() {
	assert.strictEqual( zpotri.length, 5, 'has expected arity' );
});

test( 'zpotri throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zpotri( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpotri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpotri( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpotri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpotri( 'row-major', 'upper', -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
