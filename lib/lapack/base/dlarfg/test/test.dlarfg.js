/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfg from './../lib/dlarfg.js';


// TESTS //

test( 'dlarfg is a function', function t() {
	assert.strictEqual( typeof dlarfg, 'function', 'is a function' );
});

test( 'dlarfg has expected arity', function t() {
	assert.strictEqual( dlarfg.length, 7, 'has expected arity' );
});

test( 'dlarfg throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarfg( -1, 2, 2, 2, 1, 2, 2 );
	}, RangeError );
});
