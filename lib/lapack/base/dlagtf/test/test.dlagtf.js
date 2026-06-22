/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlagtf from './../lib/dlagtf.js';


// TESTS //

test( 'dlagtf is a function', function t() {
	assert.strictEqual( typeof dlagtf, 'function', 'is a function' );
});

test( 'dlagtf has expected arity', function t() {
	assert.strictEqual( dlagtf.length, 13, 'has expected arity' );
});

test( 'dlagtf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlagtf( -1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
