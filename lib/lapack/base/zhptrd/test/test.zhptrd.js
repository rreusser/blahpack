/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhptrd from './../lib/zhptrd.js';


// TESTS //

test( 'zhptrd is a function', function t() {
	assert.strictEqual( typeof zhptrd, 'function', 'is a function' );
});

test( 'zhptrd has expected arity', function t() {
	assert.strictEqual( zhptrd.length, 6, 'has expected arity' );
});

test( 'zhptrd throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhptrd( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhptrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhptrd( 'upper', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ) );
	}, RangeError );
});
