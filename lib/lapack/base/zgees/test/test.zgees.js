/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgees from './../lib/zgees.js';


// TESTS //

test( 'zgees is a function', function t() {
	assert.strictEqual( typeof zgees, 'function', 'is a function' );
});

test( 'zgees has expected arity', function t() {
	assert.strictEqual( zgees.length, 18, 'has expected arity' );
});

test( 'zgees throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgees( 2, 2, 2, -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
