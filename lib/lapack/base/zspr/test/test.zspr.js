/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zspr from './../lib/zspr.js';


// TESTS //

test( 'zspr is a function', function t() {
	assert.strictEqual( typeof zspr, 'function', 'is a function' );
});

test( 'zspr has expected arity', function t() {
	assert.strictEqual( zspr.length, 7, 'has expected arity' );
});

test( 'zspr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zspr( 'invalid', new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zspr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zspr( 'upper', -1, 2, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
