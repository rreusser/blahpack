/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyevx from './../lib/dsyevx.js';


// TESTS //

test( 'dsyevx is a function', function t() {
	assert.strictEqual( typeof dsyevx, 'function', 'is a function' );
});

test( 'dsyevx has expected arity', function t() {
	assert.strictEqual( dsyevx.length, 23, 'has expected arity' );
});

test( 'dsyevx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyevx( 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsyevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyevx( 2, 2, 'upper', -1, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
