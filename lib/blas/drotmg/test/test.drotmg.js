/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import drotmg from './../lib/drotmg.js';


// TESTS //

test( 'drotmg is a function', function t() {
	assert.strictEqual( typeof drotmg, 'function', 'is a function' );
});

test( 'drotmg has expected arity', function t() {
	assert.strictEqual( drotmg.length, 6, 'has expected arity' );
});
