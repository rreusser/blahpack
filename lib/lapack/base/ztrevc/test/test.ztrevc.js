
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrevc from './../lib/ztrevc.js';


// TESTS //

test( 'ztrevc is a function', function t() {
	assert.strictEqual( typeof ztrevc, 'function', 'is a function' );
});

test( 'ztrevc has expected arity', function t() {
	assert.strictEqual( ztrevc.length, 18, 'has expected arity' );
});

test( 'ztrevc throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztrevc( 'invalid', 'left', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrevc throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		ztrevc( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrevc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztrevc( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'ztrevc throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztrevc( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
