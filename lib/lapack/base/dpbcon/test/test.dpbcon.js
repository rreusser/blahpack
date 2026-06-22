/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpbcon from './../lib/dpbcon.js';


// TESTS //

test( 'dpbcon is a function', function t() {
	assert.strictEqual( typeof dpbcon, 'function', 'is a function' );
});

test( 'dpbcon has expected arity', function t() {
	assert.strictEqual( dpbcon.length, 11, 'has expected arity' );
});

test( 'dpbcon throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpbcon( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dpbcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpbcon( 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
