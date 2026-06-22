/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrti2 from './../lib/ztrti2.js';


// TESTS //

test( 'ztrti2 is a function', function t() {
	assert.strictEqual( typeof ztrti2, 'function', 'is a function' );
});

test( 'ztrti2 has expected arity', function t() {
	assert.strictEqual( ztrti2.length, 6, 'has expected arity' );
});

test( 'ztrti2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		ztrti2( 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrti2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztrti2( 'row-major', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrti2 throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztrti2( 'row-major', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'ztrti2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztrti2( 'row-major', 'upper', 'non-unit', -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
