/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsycon from './../lib/dsycon.js';


// TESTS //

test( 'dsycon is a function', function t() {
	assert.strictEqual( typeof dsycon, 'function', 'is a function' );
});

test( 'dsycon has expected arity', function t() {
	assert.strictEqual( dsycon.length, 11, 'has expected arity' );
});

test( 'dsycon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsycon( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsycon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsycon( 'column-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
