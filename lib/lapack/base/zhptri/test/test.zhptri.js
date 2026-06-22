/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhptri from './../lib/zhptri.js';


// TESTS //

test( 'zhptri is a function', function t() {
	assert.strictEqual( typeof zhptri, 'function', 'is a function' );
});

test( 'zhptri has expected arity', function t() {
	assert.strictEqual( zhptri.length, 5, 'has expected arity' );
});

test( 'zhptri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhptri( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhptri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhptri( 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});
