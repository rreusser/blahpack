
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgevc from './../lib/dtgevc.js';


// TESTS //

test( 'dtgevc is a function', function t() {
	assert.strictEqual( typeof dtgevc, 'function', 'is a function' );
});

test( 'dtgevc has expected arity', function t() {
	assert.strictEqual( dtgevc.length, 18, 'has expected arity' );
});

test( 'dtgevc throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtgevc( 'invalid', 'left', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtgevc throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dtgevc( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtgevc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgevc( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtgevc throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtgevc( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
