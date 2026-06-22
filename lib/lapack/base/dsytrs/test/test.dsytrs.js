/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytrs from './../lib/dsytrs.js';


// TESTS //

test( 'dsytrs is a function', function t() {
	assert.strictEqual( typeof dsytrs, 'function', 'is a function' );
});

test( 'dsytrs has expected arity', function t() {
	assert.strictEqual( dsytrs.length, 10, 'has expected arity' );
});

test( 'dsytrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytrs( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsytrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytrs( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsytrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytrs( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dsytrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dsytrs( 'row-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
