
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgsen from './../lib/dtgsen.js';


// TESTS //

test( 'dtgsen is a function', function t() {
	assert.strictEqual( typeof dtgsen, 'function', 'is a function' );
});

test( 'dtgsen has expected arity', function t() {
	assert.strictEqual( dtgsen.length, 33, 'has expected arity' );
});

test( 'dtgsen throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtgsen( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2 );
	}, TypeError );
});

test( 'dtgsen throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgsen( 'row-major', 2, 2, 2, new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2 );
	}, RangeError );
});

test( 'dtgsen throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtgsen( 'row-major', 2, 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2 );
	}, RangeError );
});
