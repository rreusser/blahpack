/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztbcon from './../lib/ztbcon.js';


// TESTS //

test( 'ztbcon is a function', function t() {
	assert.strictEqual( typeof ztbcon, 'function', 'is a function' );
});

test( 'ztbcon has expected arity', function t() {
	assert.strictEqual( ztbcon.length, 11, 'has expected arity' );
});

test( 'ztbcon throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		ztbcon( 'column-major', 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztbcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztbcon( 'column-major', 'one-norm', 'invalid', 'non-unit', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztbcon throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztbcon( 'column-major', 'one-norm', 'upper', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztbcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztbcon( 'column-major', 'one-norm', 'upper', 'non-unit', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
