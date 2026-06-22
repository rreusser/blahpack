/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpotri from './../lib/dpotri.js';


// TESTS //

test( 'dpotri is a function', function t() {
	assert.strictEqual( typeof dpotri, 'function', 'is a function' );
});

test( 'dpotri has expected arity', function t() {
	assert.strictEqual( dpotri.length, 5, 'has expected arity' );
});

test( 'dpotri throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dpotri( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpotri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpotri( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dpotri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpotri( 'row-major', 'upper', -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
