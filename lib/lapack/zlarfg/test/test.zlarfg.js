/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlarfg from './../lib/zlarfg.js';


// TESTS //

test( 'zlarfg is a function', function t() {
	assert.strictEqual( typeof zlarfg, 'function', 'is a function' );
});

test( 'zlarfg has expected arity', function t() {
	assert.strictEqual( zlarfg.length, 5, 'has expected arity' );
});

test( 'zlarfg throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlarfg( -1, 2, 2, 1, 2 );
	}, RangeError );
});
