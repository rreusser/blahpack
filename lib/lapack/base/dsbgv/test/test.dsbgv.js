/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbgv from './../lib/dsbgv.js';


// TESTS //

test( 'dsbgv is a function', function t() {
	assert.strictEqual( typeof dsbgv, 'function', 'is a function' );
});

test( 'dsbgv has expected arity', function t() {
	assert.strictEqual( dsbgv.length, 16, 'has expected arity' );
});

test( 'dsbgv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsbgv( 'invalid', 2, 'upper', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsbgv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsbgv( 'row-major', 2, 'invalid', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsbgv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsbgv( 'row-major', 2, 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
