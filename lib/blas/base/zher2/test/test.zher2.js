/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zher2 from './../lib/zher2.js';


// TESTS //

test( 'zher2 is a function', function t() {
	assert.strictEqual( typeof zher2, 'function', 'is a function' );
});

test( 'zher2 has expected arity', function t() {
	assert.strictEqual( zher2.length, 10, 'has expected arity' );
});

test( 'zher2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zher2( 'invalid', 'upper', new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zher2 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zher2( 'row-major', 'invalid', new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zher2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zher2( 'row-major', 'upper', -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
