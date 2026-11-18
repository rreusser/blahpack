/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpptri from './../lib/dpptri.js';


// TESTS //

test( 'dpptri is a function', function t() {
	assert.strictEqual( typeof dpptri, 'function', 'is a function' );
});

test( 'dpptri has expected arity', function t() {
	assert.strictEqual( dpptri.length, 4, 'has expected arity' );
});

test( 'dpptri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpptri( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dpptri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpptri( 'column-major', 'upper', -1, new Float64Array( 4 ) );
	}, RangeError );
});
