/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpcon from './../lib/dtpcon.js';


// TESTS //

test( 'dtpcon is a function', function t() {
	assert.strictEqual( typeof dtpcon, 'function', 'is a function' );
});

test( 'dtpcon has expected arity', function t() {
	assert.strictEqual( dtpcon.length, 8, 'has expected arity' );
});

test( 'dtpcon throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dtpcon( 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtpcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtpcon( 'one-norm', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtpcon throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtpcon( 'one-norm', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtpcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtpcon( 'one-norm', 'upper', 'non-unit', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
