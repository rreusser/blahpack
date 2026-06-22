/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgetri from './../lib/dgetri.js';


// TESTS //

test( 'dgetri is a function', function t() {
	assert.strictEqual( typeof dgetri, 'function', 'is a function' );
});

test( 'dgetri has expected arity', function t() {
	assert.strictEqual( dgetri.length, 9, 'has expected arity' );
});

test( 'dgetri throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgetri( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'dgetri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgetri( 'row-major', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
