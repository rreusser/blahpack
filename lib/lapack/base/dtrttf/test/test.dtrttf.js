/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrttf from './../lib/dtrttf.js';


// TESTS //

test( 'dtrttf is a function', function t() {
	assert.strictEqual( typeof dtrttf, 'function', 'is a function' );
});

test( 'dtrttf has expected arity', function t() {
	assert.strictEqual( dtrttf.length, 7, 'has expected arity' );
});

test( 'dtrttf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtrttf( 'invalid', 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtrttf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtrttf( 'row-major', 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dtrttf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrttf( 'row-major', 2, 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
