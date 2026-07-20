/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlantr from './../lib/dlantr.js';
import ndarray from './../lib/ndarray.js';


// FIXTURES //

// Upper-triangular [[1,2],[0,3]] (column-major):
function upper2() {
	return new Float64Array([ 1.0, 0.0, 2.0, 3.0 ]);
}


// TESTS //

test( 'dlantr is a function', function t() {
	assert.strictEqual( typeof dlantr, 'function', 'is a function' );
});

test( 'dlantr has expected arity', function t() {
	assert.strictEqual( dlantr.length, 10, 'has expected arity' );
});

test( 'dlantr throws a TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		dlantr( 'invalid', 'max', 'upper', 'non-unit', 2, 2, upper2(), 2, null, 1 );
	}, TypeError );
});

test( 'dlantr throws a TypeError for an invalid norm', function t() {
	assert.throws( function throws() {
		dlantr( 'column-major', 'bogus', 'upper', 'non-unit', 2, 2, upper2(), 2, null, 1 );
	}, TypeError );
});

test( 'dlantr throws a TypeError for an invalid uplo', function t() {
	assert.throws( function throws() {
		dlantr( 'column-major', 'max', 'bogus', 'non-unit', 2, 2, upper2(), 2, null, 1 );
	}, TypeError );
});

test( 'dlantr computes the max norm of the upper triangle', function t() {
	const v = dlantr( 'column-major', 'max', 'upper', 'non-unit', 2, 2, upper2(), 2, null, 1 );
	assert.ok( Math.abs( v - 3.0 ) < 1e-12, 'max norm is 3' );
});

test( 'dlantr computes the one norm (max column sum of the upper triangle)', function t() {
	const v = dlantr( 'column-major', 'one-norm', 'upper', 'non-unit', 2, 2, upper2(), 2, null, 1 );
	assert.ok( Math.abs( v - 5.0 ) < 1e-12, 'one norm is 5' );
});

test( 'dlantr computes the Frobenius norm', function t() {
	const v = dlantr( 'column-major', 'frobenius', 'upper', 'non-unit', 2, 2, upper2(), 2, null, 1 );
	assert.ok( Math.abs( v - Math.sqrt( 14.0 ) ) < 1e-12, 'frobenius norm is sqrt(14)' );
});

test( 'dlantr computes the infinity norm (uses WORK)', function t() {
	const v = dlantr( 'column-major', 'inf-norm', 'upper', 'non-unit', 2, 2, upper2(), 2, null, 1 );
	assert.ok( Math.abs( v - 3.0 ) < 1e-12, 'inf norm is 3' );
});

test( 'dlantr matches the ndarray form (inf norm)', function t() {
	const v1 = dlantr( 'column-major', 'inf-norm', 'upper', 'non-unit', 2, 2, upper2(), 2, null, 1 );
	const WORK = new Float64Array( 2 );
	const v2 = ndarray( 'inf-norm', 'upper', 'non-unit', 2, 2, upper2(), 1, 2, 0, WORK, 1, 0 );
	assert.ok( Math.abs( v1 - v2 ) < 1e-14, 'matches the ndarray form' );
});
