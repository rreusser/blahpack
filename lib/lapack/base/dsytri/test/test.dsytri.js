/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytri from './../lib/dsytri.js';


// TESTS //

test( 'dsytri is a function', function t() {
	assert.strictEqual( typeof dsytri, 'function', 'is a function' );
});

test( 'dsytri has expected arity', function t() {
	assert.strictEqual( dsytri.length, 8, 'has expected arity' );
});

test( 'dsytri throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dsytri( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsytri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsytri( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsytri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsytri( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ) );
	}, RangeError );
});
