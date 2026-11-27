/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import drotg from './../lib/drotg.js';


// TESTS //

test( 'drotg is a function', function t() {
	assert.strictEqual( typeof drotg, 'function', 'is a function' );
});

test( 'drotg has expected arity', function t() {
	assert.strictEqual( drotg.length, 4, 'has expected arity' );
});
