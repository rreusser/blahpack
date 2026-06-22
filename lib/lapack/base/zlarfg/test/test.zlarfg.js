/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlarfg from './../lib/zlarfg.js';


// TESTS //

test( 'zlarfg is a function', function t() {
	assert.strictEqual( typeof zlarfg, 'function', 'is a function' );
});

test( 'zlarfg has expected arity', function t() {
	assert.strictEqual( zlarfg.length, 7, 'has expected arity' );
});

test( 'zlarfg throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarfg( -1, 2, 2, 2, 1, 2, 2 );
	}, RangeError );
});
