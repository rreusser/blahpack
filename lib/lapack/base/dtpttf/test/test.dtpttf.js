/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpttf from './../lib/dtpttf.js';


// TESTS //

test( 'dtpttf is a function', function t() {
	assert.strictEqual( typeof dtpttf, 'function', 'is a function' );
});

test( 'dtpttf has expected arity', function t() {
	assert.strictEqual( dtpttf.length, 5, 'has expected arity' );
});

test( 'dtpttf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtpttf( 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtpttf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtpttf( 2, 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
