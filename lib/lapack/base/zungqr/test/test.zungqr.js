/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zungqr from './../lib/zungqr.js';


// TESTS //

test( 'zungqr is a function', function t() {
	assert.strictEqual( typeof zungqr, 'function', 'is a function' );
});

test( 'zungqr has expected arity', function t() {
	assert.strictEqual( zungqr.length, 10, 'has expected arity' );
});

test( 'zungqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zungqr( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zungqr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zungqr( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zungqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zungqr( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zungqr throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zungqr( 'row-major', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
