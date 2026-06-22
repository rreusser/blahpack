/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dbdsqr from './../lib/dbdsqr.js';


// TESTS //

test( 'dbdsqr is a function', function t() {
	assert.strictEqual( typeof dbdsqr, 'function', 'is a function' );
});

test( 'dbdsqr has expected arity', function t() {
	assert.strictEqual( dbdsqr.length, 18, 'has expected arity' );
});

test( 'dbdsqr throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dbdsqr( 'invalid', 'upper', new Float64Array( 4 ), 2, 2, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dbdsqr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dbdsqr( 'row-major', 'invalid', new Float64Array( 4 ), 2, 2, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dbdsqr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dbdsqr( 'row-major', 'upper', -1, 2, 2, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
