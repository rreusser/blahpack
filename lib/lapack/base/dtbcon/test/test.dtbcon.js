/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtbcon from './../lib/dtbcon.js';


// TESTS //

test( 'dtbcon is a function', function t() {
	assert.strictEqual( typeof dtbcon, 'function', 'is a function' );
});

test( 'dtbcon has expected arity', function t() {
	assert.strictEqual( dtbcon.length, 10, 'has expected arity' );
});

test( 'dtbcon throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dtbcon( 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtbcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtbcon( 'one-norm', 'invalid', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtbcon throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtbcon( 'one-norm', 'upper', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtbcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtbcon( 'one-norm', 'upper', 'non-unit', -1, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
