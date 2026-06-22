/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zunmhr from './../lib/zunmhr.js';


// TESTS //

test( 'zunmhr is a function', function t() {
	assert.strictEqual( typeof zunmhr, 'function', 'is a function' );
});

test( 'zunmhr has expected arity', function t() {
	assert.strictEqual( zunmhr.length, 15, 'has expected arity' );
});

test( 'zunmhr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunmhr( 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'zunmhr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunmhr( 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'zunmhr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunmhr( 'left', 'no-transpose', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'zunmhr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunmhr( 'left', 'no-transpose', new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
