/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpsv from './../lib/zhpsv.js';


// TESTS //

test( 'zhpsv is a function', function t() {
	assert.strictEqual( typeof zhpsv, 'function', 'is a function' );
});

test( 'zhpsv has expected arity', function t() {
	assert.strictEqual( zhpsv.length, 9, 'has expected arity' );
});

test( 'zhpsv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpsv( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zhpsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpsv( 'upper', -1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zhpsv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zhpsv( 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
