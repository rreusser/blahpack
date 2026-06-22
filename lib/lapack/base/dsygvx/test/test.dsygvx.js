/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsygvx from './../lib/dsygvx.js';


// TESTS //

test( 'dsygvx is a function', function t() {
	assert.strictEqual( typeof dsygvx, 'function', 'is a function' );
});

test( 'dsygvx has expected arity', function t() {
	assert.strictEqual( dsygvx.length, 26, 'has expected arity' );
});

test( 'dsygvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsygvx( 2, 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsygvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsygvx( 2, 2, 2, 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
