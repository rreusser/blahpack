/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhgeqz from './../lib/zhgeqz.js';


// TESTS //

test( 'zhgeqz is a function', function t() {
	assert.strictEqual( typeof zhgeqz, 'function', 'is a function' );
});

test( 'zhgeqz has expected arity', function t() {
	assert.strictEqual( zhgeqz.length, 24, 'has expected arity' );
});

test( 'zhgeqz throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhgeqz( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhgeqz throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhgeqz( 'row-major', 2, 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
