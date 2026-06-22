/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarra from './../lib/dlarra.js';


// TESTS //

test( 'dlarra is a function', function t() {
	assert.strictEqual( typeof dlarra, 'function', 'is a function' );
});

test( 'dlarra has expected arity', function t() {
	assert.strictEqual( dlarra.length, 12, 'has expected arity' );
});

test( 'dlarra throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarra( -1, 2, 1, 2, 1, new Float64Array( 4 ), 1, 2, 2, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
