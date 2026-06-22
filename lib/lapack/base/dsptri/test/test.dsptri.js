/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsptri from './../lib/dsptri.js';


// TESTS //

test( 'dsptri is a function', function t() {
	assert.strictEqual( typeof dsptri, 'function', 'is a function' );
});

test( 'dsptri has expected arity', function t() {
	assert.strictEqual( dsptri.length, 4, 'has expected arity' );
});

test( 'dsptri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsptri( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsptri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsptri( 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
