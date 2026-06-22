/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhegv from './../lib/zhegv.js';


// TESTS //

test( 'zhegv is a function', function t() {
	assert.strictEqual( typeof zhegv, 'function', 'is a function' );
});

test( 'zhegv has expected arity', function t() {
	assert.strictEqual( zhegv.length, 15, 'has expected arity' );
});

test( 'zhegv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhegv( 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhegv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhegv( 2, 2, 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
