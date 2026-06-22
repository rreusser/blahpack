/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqsb from './../lib/dlaqsb.js';


// TESTS //

test( 'dlaqsb is a function', function t() {
	assert.strictEqual( typeof dlaqsb, 'function', 'is a function' );
});

test( 'dlaqsb has expected arity', function t() {
	assert.strictEqual( dlaqsb.length, 9, 'has expected arity' );
});

test( 'dlaqsb throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlaqsb( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2 );
	}, TypeError );
});

test( 'dlaqsb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqsb( 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2 );
	}, RangeError );
});
