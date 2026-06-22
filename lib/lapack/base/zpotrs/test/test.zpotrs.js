/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpotrs from './../lib/zpotrs.js';


// TESTS //

test( 'zpotrs is a function', function t() {
	assert.strictEqual( typeof zpotrs, 'function', 'is a function' );
});

test( 'zpotrs has expected arity', function t() {
	assert.strictEqual( zpotrs.length, 8, 'has expected arity' );
});

test( 'zpotrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zpotrs( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpotrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpotrs( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zpotrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpotrs( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zpotrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zpotrs( 'row-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
