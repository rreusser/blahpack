/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrcon from './../lib/dtrcon.js';


// TESTS //

test( 'dtrcon is a function', function t() {
	assert.strictEqual( typeof dtrcon, 'function', 'is a function' );
});

test( 'dtrcon has expected arity', function t() {
	assert.strictEqual( dtrcon.length, 11, 'has expected arity' );
});

test( 'dtrcon throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dtrcon( 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dtrcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtrcon( 'one-norm', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dtrcon throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		dtrcon( 'one-norm', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dtrcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrcon( 'one-norm', 'upper', 'non-unit', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
