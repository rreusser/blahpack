/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrttf from './../lib/ztrttf.js';


// TESTS //

test( 'ztrttf is a function', function t() {
	assert.strictEqual( typeof ztrttf, 'function', 'is a function' );
});

test( 'ztrttf has expected arity', function t() {
	assert.strictEqual( ztrttf.length, 7, 'has expected arity' );
});

test( 'ztrttf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztrttf( 'invalid', 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztrttf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztrttf( 'row-major', 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztrttf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztrttf( 'row-major', 2, 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
