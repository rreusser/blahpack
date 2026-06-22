/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlatdf from './../lib/zlatdf.js';


// TESTS //

test( 'zlatdf is a function', function t() {
	assert.strictEqual( typeof zlatdf, 'function', 'is a function' );
});

test( 'zlatdf has expected arity', function t() {
	assert.strictEqual( zlatdf.length, 12, 'has expected arity' );
});

test( 'zlatdf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlatdf( 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
