/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztptri from './../lib/ztptri.js';


// TESTS //

test( 'ztptri is a function', function t() {
	assert.strictEqual( typeof ztptri, 'function', 'is a function' );
});

test( 'ztptri has expected arity', function t() {
	assert.strictEqual( ztptri.length, 4, 'has expected arity' );
});

test( 'ztptri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ztptri( 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztptri throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		ztptri( 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'ztptri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztptri( 'upper', 'non-unit', -1, new Float64Array( 4 ) );
	}, RangeError );
});
