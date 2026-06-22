/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsyrk from './../lib/zsyrk.js';


// TESTS //

test( 'zsyrk is a function', function t() {
	assert.strictEqual( typeof zsyrk, 'function', 'is a function' );
});

test( 'zsyrk has expected arity', function t() {
	assert.strictEqual( zsyrk.length, 11, 'has expected arity' );
});

test( 'zsyrk throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsyrk( 'invalid', 'upper', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zsyrk throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsyrk( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zsyrk throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zsyrk( 'row-major', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zsyrk throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsyrk( 'row-major', 'upper', 'no-transpose', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zsyrk throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zsyrk( 'row-major', 'upper', 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
