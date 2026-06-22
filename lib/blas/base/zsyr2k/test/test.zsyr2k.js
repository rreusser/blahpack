/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsyr2k from './../lib/zsyr2k.js';


// TESTS //

test( 'zsyr2k is a function', function t() {
	assert.strictEqual( typeof zsyr2k, 'function', 'is a function' );
});

test( 'zsyr2k has expected arity', function t() {
	assert.strictEqual( zsyr2k.length, 13, 'has expected arity' );
});

test( 'zsyr2k throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsyr2k( 'invalid', 'upper', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zsyr2k throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsyr2k( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zsyr2k throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zsyr2k( 'row-major', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zsyr2k throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsyr2k( 'row-major', 'upper', 'no-transpose', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zsyr2k throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zsyr2k( 'row-major', 'upper', 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
