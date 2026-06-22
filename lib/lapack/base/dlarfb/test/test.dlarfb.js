/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfb from './../lib/dlarfb.js';


// TESTS //

test( 'dlarfb is a function', function t() {
	assert.strictEqual( typeof dlarfb, 'function', 'is a function' );
});

test( 'dlarfb has expected arity', function t() {
	assert.strictEqual( dlarfb.length, 16, 'has expected arity' );
});

test( 'dlarfb throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlarfb( 'invalid', 'left', 'no-transpose', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlarfb throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dlarfb( 'row-major', 'invalid', 'no-transpose', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlarfb throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dlarfb( 'row-major', 'left', 'invalid', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlarfb throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlarfb( 'row-major', 'left', 'no-transpose', 2, 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlarfb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarfb( 'row-major', 'left', 'no-transpose', 2, 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlarfb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlarfb( 'row-major', 'left', 'no-transpose', 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
