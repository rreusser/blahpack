/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlartgp from './../lib/dlartgp.js';


// TESTS //

test( 'dlartgp is a function', function t() {
	assert.strictEqual( typeof dlartgp, 'function', 'is a function' );
});

test( 'dlartgp has expected arity', function t() {
	assert.strictEqual( dlartgp.length, 2, 'has expected arity' );
});
