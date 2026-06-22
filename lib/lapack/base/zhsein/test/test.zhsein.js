

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhsein from './../lib/zhsein.js';


// TESTS //

test( 'zhsein is a function', function t() {
	assert.strictEqual( typeof zhsein, 'function', 'is a function' );
});

test( 'zhsein has expected arity', function t() {
	assert.strictEqual( zhsein.length, 27, 'has expected arity' );
});

test( 'zhsein throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhsein( 'invalid', 'left', 'no-transpose', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zhsein throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zhsein( 'row-major', 'invalid', 'no-transpose', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2 );
	}, TypeError );
});

test( 'zhsein throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhsein( 'row-major', 'left', 'no-transpose', 'no-transpose', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2 );
	}, RangeError );
});

test( 'zhsein throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zhsein( 'row-major', 'left', 'no-transpose', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2 );
	}, RangeError );
});

