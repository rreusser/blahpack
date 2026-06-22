/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsycon from './../lib/zsycon.js';


// TESTS //

test( 'zsycon is a function', function t() {
	assert.strictEqual( typeof zsycon, 'function', 'is a function' );
});

test( 'zsycon has expected arity', function t() {
	assert.strictEqual( zsycon.length, 10, 'has expected arity' );
});

test( 'zsycon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsycon( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zsycon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsycon( 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
