/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsptri from './../lib/zsptri.js';


// TESTS //

test( 'zsptri is a function', function t() {
	assert.strictEqual( typeof zsptri, 'function', 'is a function' );
});

test( 'zsptri has expected arity', function t() {
	assert.strictEqual( zsptri.length, 6, 'has expected arity' );
});

test( 'zsptri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsptri( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zsptri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsptri( 'column-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
