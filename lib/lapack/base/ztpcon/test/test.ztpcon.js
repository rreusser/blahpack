/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztpcon from './../lib/ztpcon.js';


// TESTS //

test( 'ztpcon is a function', function t() {
	assert.strictEqual( typeof ztpcon, 'function', 'is a function' );
});

test( 'ztpcon has expected arity', function t() {
	assert.strictEqual( ztpcon.length, 9, 'has expected arity' );
});

test( 'ztpcon throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		ztpcon( 'column-major', 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztpcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztpcon( 'column-major', 'one-norm', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztpcon throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztpcon( 'column-major', 'one-norm', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztpcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztpcon( 'column-major', 'one-norm', 'upper', 'non-unit', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
