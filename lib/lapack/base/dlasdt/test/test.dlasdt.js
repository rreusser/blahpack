/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlasdt from './../lib/dlasdt.js';


// TESTS //

test( 'dlasdt is a function', function t() {
	assert.strictEqual( typeof dlasdt, 'function', 'is a function' );
});

test( 'dlasdt has expected arity', function t() {
	assert.strictEqual( dlasdt.length, 10, 'has expected arity' );
});

test( 'dlasdt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlasdt( -1, 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
