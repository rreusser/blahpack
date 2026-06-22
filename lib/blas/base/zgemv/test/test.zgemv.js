/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgemv from './../lib/zgemv.js';


// TESTS //

test( 'zgemv is a function', function t() {
	assert.strictEqual( typeof zgemv, 'function', 'is a function' );
});

test( 'zgemv has expected arity', function t() {
	assert.strictEqual( zgemv.length, 12, 'has expected arity' );
});

test( 'zgemv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgemv( 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'zgemv throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zgemv( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'zgemv throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgemv( 'row-major', 'no-transpose', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});

test( 'zgemv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgemv( 'row-major', 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});
