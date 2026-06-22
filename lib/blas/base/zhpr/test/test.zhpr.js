/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpr from './../lib/zhpr.js';


// TESTS //

test( 'zhpr is a function', function t() {
	assert.strictEqual( typeof zhpr, 'function', 'is a function' );
});

test( 'zhpr has expected arity', function t() {
	assert.strictEqual( zhpr.length, 7, 'has expected arity' );
});

test( 'zhpr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpr( 'invalid', new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhpr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpr( 'upper', -1, 2, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
