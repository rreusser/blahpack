/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytd2 from './../lib/dsytd2.js';


// TESTS //

test( 'dsytd2 is a function', function t() {
	assert.strictEqual( typeof dsytd2, 'function', 'is a function' );
});

test( 'dsytd2 has expected arity', function t() {
	assert.strictEqual( dsytd2.length, 11, 'has expected arity' );
});

test( 'dsytd2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytd2( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsytd2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytd2( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsytd2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytd2( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
