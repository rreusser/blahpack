/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpocon from './../lib/dpocon.js';


// TESTS //

test( 'dpocon is a function', function t() {
	assert.strictEqual( typeof dpocon, 'function', 'is a function' );
});

test( 'dpocon has expected arity', function t() {
	assert.strictEqual( dpocon.length, 11, 'has expected arity' );
});

test( 'dpocon throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dpocon( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dpocon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpocon( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dpocon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpocon( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
