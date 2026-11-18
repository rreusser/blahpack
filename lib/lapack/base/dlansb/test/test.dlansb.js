/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlansb from './../lib/dlansb.js';


// TESTS //

test( 'dlansb is a function', function t() {
	assert.strictEqual( typeof dlansb, 'function', 'is a function' );
});

test( 'dlansb has expected arity', function t() {
	assert.strictEqual( dlansb.length, 8, 'has expected arity' );
});

test( 'dlansb throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlansb( 'column-major', 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlansb throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlansb( 'column-major', 'max', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlansb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlansb( 'column-major', 'max', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlansb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlansb( 'column-major', 'max', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
