/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlartg from './../lib/dlartg.js';


// TESTS //

test( 'dlartg is a function', function t() {
	assert.strictEqual( typeof dlartg, 'function', 'is a function' );
});

test( 'dlartg has expected arity', function t() {
	assert.strictEqual( dlartg.length, 5, 'has expected arity' );
});
