/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsytrs from './../lib/zsytrs.js';


// TESTS //

test( 'zsytrs is a function', function t() {
	assert.strictEqual( typeof zsytrs, 'function', 'is a function' );
});

test( 'zsytrs has expected arity', function t() {
	assert.strictEqual( zsytrs.length, 14, 'has expected arity' );
});

test( 'zsytrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytrs( 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 1, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, 1, 2 );
	}, TypeError );
});

test( 'zsytrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytrs( 'upper', -1, 2, new Float64Array( 4 ), 1, 1, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, 1, 2 );
	}, RangeError );
});

test( 'zsytrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zsytrs( 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 1, 1, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, 1, 2 );
	}, RangeError );
});
