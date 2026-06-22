/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtfttr from './../lib/dtfttr.js';


// TESTS //

test( 'dtfttr is a function', function t() {
	assert.strictEqual( typeof dtfttr, 'function', 'is a function' );
});

test( 'dtfttr has expected arity', function t() {
	assert.strictEqual( dtfttr.length, 7, 'has expected arity' );
});

test( 'dtfttr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtfttr( 'invalid', 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtfttr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtfttr( 'row-major', 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtfttr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtfttr( 'row-major', 2, 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});
