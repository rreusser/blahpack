/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgelq2 from './../lib/zgelq2.js';


// TESTS //

test( 'zgelq2 is a function', function t() {
	assert.strictEqual( typeof zgelq2, 'function', 'is a function' );
});

test( 'zgelq2 has expected arity', function t() {
	assert.strictEqual( zgelq2.length, 9, 'has expected arity' );
});

test( 'zgelq2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgelq2( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zgelq2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgelq2( 'row-major', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgelq2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgelq2( 'row-major', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
