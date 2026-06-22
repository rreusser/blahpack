/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyev from './../lib/dsyev.js';


// TESTS //

test( 'dsyev is a function', function t() {
	assert.strictEqual( typeof dsyev, 'function', 'is a function' );
});

test( 'dsyev has expected arity', function t() {
	assert.strictEqual( dsyev.length, 10, 'has expected arity' );
});

test( 'dsyev throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsyev( 'invalid', 2, 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsyev throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsyev( 'row-major', 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsyev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsyev( 'row-major', 2, 'upper', -1, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
