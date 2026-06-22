/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dptcon from './../lib/dptcon.js';


// TESTS //

test( 'dptcon is a function', function t() {
	assert.strictEqual( typeof dptcon, 'function', 'is a function' );
});

test( 'dptcon has expected arity', function t() {
	assert.strictEqual( dptcon.length, 9, 'has expected arity' );
});

test( 'dptcon throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dptcon( -1, 2, 1, 2, 1, 2, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
