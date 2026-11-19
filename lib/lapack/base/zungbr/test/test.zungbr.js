/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zungbr from './../lib/zungbr.js';


// TESTS //

test( 'zungbr is a function', function t() {
	assert.strictEqual( typeof zungbr, 'function', 'is a function' );
});

test( 'zungbr has expected arity', function t() {
	assert.strictEqual( zungbr.length, 10, 'has expected arity' );
});

test( 'zungbr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zungbr( 'invalid', 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zungbr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zungbr( 'row-major', 'apply-P', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zungbr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zungbr( 'row-major', 'apply-P', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zungbr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zungbr( 'row-major', 'apply-P', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});
