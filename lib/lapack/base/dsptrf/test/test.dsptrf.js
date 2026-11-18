/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsptrf from './../lib/dsptrf.js';


// TESTS //

test( 'dsptrf is a function', function t() {
	assert.strictEqual( typeof dsptrf, 'function', 'is a function' );
});

test( 'dsptrf has expected arity', function t() {
	assert.strictEqual( dsptrf.length, 5, 'has expected arity' );
});

test( 'dsptrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsptrf( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsptrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsptrf( 'column-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
