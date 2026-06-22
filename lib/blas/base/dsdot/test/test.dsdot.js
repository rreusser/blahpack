/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsdot from './../lib/dsdot.js';


// TESTS //

test( 'dsdot is a function', function t() {
	assert.strictEqual( typeof dsdot, 'function', 'is a function' );
});

test( 'dsdot has expected arity', function t() {
	assert.strictEqual( dsdot.length, 5, 'has expected arity' );
});

test( 'dsdot throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsdot( -1, 2, 1, 2, 1 );
	}, RangeError );
});
