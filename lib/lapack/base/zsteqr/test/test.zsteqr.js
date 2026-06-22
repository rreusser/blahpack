/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsteqr from './../lib/zsteqr.js';


// TESTS //

test( 'zsteqr is a function', function t() {
	assert.strictEqual( typeof zsteqr, 'function', 'is a function' );
});

test( 'zsteqr has expected arity', function t() {
	assert.strictEqual( zsteqr.length, 11, 'has expected arity' );
});

test( 'zsteqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsteqr( 'invalid', 2, new Float64Array( 4 ), 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zsteqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsteqr( 'row-major', 2, -1, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
