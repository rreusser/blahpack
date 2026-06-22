/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyr from './../lib/dsyr.js';


// TESTS //

test( 'dsyr is a function', function t() {
	assert.strictEqual( typeof dsyr, 'function', 'is a function' );
});

test( 'dsyr has expected arity', function t() {
	assert.strictEqual( dsyr.length, 8, 'has expected arity' );
});

test( 'dsyr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsyr( 'invalid', 'upper', new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsyr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyr( 'row-major', 'invalid', new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dsyr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyr( 'row-major', 'upper', -1, 2, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
