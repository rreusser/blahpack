/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatrd from './../lib/dlatrd.js';


// TESTS //

test( 'dlatrd is a function', function t() {
	assert.strictEqual( typeof dlatrd, 'function', 'is a function' );
});

test( 'dlatrd has expected arity', function t() {
	assert.strictEqual( dlatrd.length, 12, 'has expected arity' );
});

test( 'dlatrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlatrd( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlatrd throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlatrd( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlatrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlatrd( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
