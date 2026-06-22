/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspsv from './../lib/dspsv.js';


// TESTS //

test( 'dspsv is a function', function t() {
	assert.strictEqual( typeof dspsv, 'function', 'is a function' );
});

test( 'dspsv has expected arity', function t() {
	assert.strictEqual( dspsv.length, 7, 'has expected arity' );
});

test( 'dspsv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dspsv( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dspsv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dspsv( 'upper', -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dspsv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dspsv( 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});
