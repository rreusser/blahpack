/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhetrd from './../lib/zhetrd.js';


// TESTS //

test( 'zhetrd is a function', function t() {
	assert.strictEqual( typeof zhetrd, 'function', 'is a function' );
});

test( 'zhetrd has expected arity', function t() {
	assert.strictEqual( zhetrd.length, 11, 'has expected arity' );
});

test( 'zhetrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetrd( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhetrd throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetrd( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zhetrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetrd( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
