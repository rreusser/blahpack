/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgsja from './../lib/dtgsja.js';


// TESTS //

test( 'dtgsja is a function', function t() {
	assert.strictEqual( typeof dtgsja, 'function', 'is a function' );
});

test( 'dtgsja has expected arity', function t() {
	assert.strictEqual( dtgsja.length, 27, 'has expected arity' );
});

test( 'dtgsja throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtgsja( 2, 2, 2, -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'dtgsja throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgsja( 2, 2, 2, new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'dtgsja throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dtgsja( 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
