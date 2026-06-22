/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtpttr from './../lib/dtpttr.js';


// TESTS //

test( 'dtpttr is a function', function t() {
	assert.strictEqual( typeof dtpttr, 'function', 'is a function' );
});

test( 'dtpttr has expected arity', function t() {
	assert.strictEqual( dtpttr.length, 6, 'has expected arity' );
});

test( 'dtpttr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtpttr( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtpttr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dtpttr( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtpttr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtpttr( 'row-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});
