/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhegvx from './../lib/zhegvx.js';


// TESTS //

test( 'zhegvx is a function', function t() {
	assert.strictEqual( typeof zhegvx, 'function', 'is a function' );
});

test( 'zhegvx has expected arity', function t() {
	assert.strictEqual( zhegvx.length, 28, 'has expected arity' );
});

test( 'zhegvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhegvx( 2, 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhegvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhegvx( 2, 2, 2, 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
