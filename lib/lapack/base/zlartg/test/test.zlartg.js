/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlartg from './../lib/zlartg.js';


// TESTS //

test( 'zlartg is a function', function t() {
	assert.strictEqual( typeof zlartg, 'function', 'is a function' );
});

test( 'zlartg has expected arity', function t() {
	assert.strictEqual( zlartg.length, 5, 'has expected arity' );
});
