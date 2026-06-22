/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpotrs from './../lib/dpotrs.js';


// TESTS //

test( 'dpotrs is a function', function t() {
	assert.strictEqual( typeof dpotrs, 'function', 'is a function' );
});

test( 'dpotrs has expected arity', function t() {
	assert.strictEqual( dpotrs.length, 8, 'has expected arity' );
});

test( 'dpotrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dpotrs( 'invalid', 'upper', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpotrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpotrs( 'row-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpotrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpotrs( 'row-major', 'upper', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dpotrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dpotrs( 'row-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
