/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyr2k from './../lib/dsyr2k.js';


// TESTS //

test( 'dsyr2k is a function', function t() {
	assert.strictEqual( typeof dsyr2k, 'function', 'is a function' );
});

test( 'dsyr2k has expected arity', function t() {
	assert.strictEqual( dsyr2k.length, 13, 'has expected arity' );
});

test( 'dsyr2k throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsyr2k( 'invalid', 'upper', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsyr2k throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyr2k( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsyr2k throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dsyr2k( 'row-major', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsyr2k throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyr2k( 'row-major', 'upper', 'no-transpose', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dsyr2k throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dsyr2k( 'row-major', 'upper', 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
