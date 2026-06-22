/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhbmv from './../lib/zhbmv.js';


// TESTS //

test( 'zhbmv is a function', function t() {
	assert.strictEqual( typeof zhbmv, 'function', 'is a function' );
});

test( 'zhbmv has expected arity', function t() {
	assert.strictEqual( zhbmv.length, 12, 'has expected arity' );
});

test( 'zhbmv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhbmv( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'zhbmv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhbmv( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'zhbmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhbmv( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});

test( 'zhbmv throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zhbmv( 'row-major', 'upper', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, 2, 1, 2, 2, 1 );
	}, RangeError );
});
