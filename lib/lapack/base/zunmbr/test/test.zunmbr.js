/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zunmbr from './../lib/zunmbr.js';


// TESTS //

test( 'zunmbr is a function', function t() {
	assert.strictEqual( typeof zunmbr, 'function', 'is a function' );
});

test( 'zunmbr has expected arity', function t() {
	assert.strictEqual( zunmbr.length, 15, 'has expected arity' );
});

test( 'zunmbr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunmbr( 'invalid', 2, 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zunmbr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunmbr( 'row-major', 2, 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zunmbr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunmbr( 'row-major', 2, 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zunmbr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunmbr( 'row-major', 2, 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunmbr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunmbr( 'row-major', 2, 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zunmbr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zunmbr( 'row-major', 2, 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
