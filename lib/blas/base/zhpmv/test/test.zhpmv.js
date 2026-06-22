/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpmv from './../lib/zhpmv.js';


// TESTS //

test( 'zhpmv is a function', function t() {
	assert.strictEqual( typeof zhpmv, 'function', 'is a function' );
});

test( 'zhpmv has expected arity', function t() {
	assert.strictEqual( zhpmv.length, 10, 'has expected arity' );
});

test( 'zhpmv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpmv( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 1, 2, 2, 1 );
	}, TypeError );
});

test( 'zhpmv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpmv( 'upper', -1, 2, new Float64Array( 4 ), 1, 2, 1, 2, 2, 1 );
	}, RangeError );
});
