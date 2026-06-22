/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlanst from './../lib/dlanst.js';


// TESTS //

test( 'dlanst is a function', function t() {
	assert.strictEqual( typeof dlanst, 'function', 'is a function' );
});

test( 'dlanst has expected arity', function t() {
	assert.strictEqual( dlanst.length, 6, 'has expected arity' );
});

test( 'dlanst throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlanst( 'invalid', new Float64Array( 4 ), 2, 1, 2, 1 );
	}, TypeError );
});

test( 'dlanst throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlanst( 'max', -1, 2, 1, 2, 1 );
	}, RangeError );
});
