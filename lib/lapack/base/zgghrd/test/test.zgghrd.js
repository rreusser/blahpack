/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgghrd from './../lib/zgghrd.js';


// TESTS //

test( 'zgghrd is a function', function t() {
	assert.strictEqual( typeof zgghrd, 'function', 'is a function' );
});

test( 'zgghrd has expected arity', function t() {
	assert.strictEqual( zgghrd.length, 14, 'has expected arity' );
});

test( 'zgghrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgghrd( 'invalid', 2, 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgghrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgghrd( 'row-major', 2, 2, -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
