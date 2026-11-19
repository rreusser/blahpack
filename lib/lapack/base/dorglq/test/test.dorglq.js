/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorglq from './../lib/dorglq.js';


// TESTS //

test( 'dorglq is a function', function t() {
	assert.strictEqual( typeof dorglq, 'function', 'is a function' );
});

test( 'dorglq has expected arity', function t() {
	assert.strictEqual( dorglq.length, 9, 'has expected arity' );
});

test( 'dorglq throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dorglq( 'invalid', 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dorglq throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dorglq( 'row-major', -1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorglq throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dorglq( 'row-major', 2, -1, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dorglq throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dorglq( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});
