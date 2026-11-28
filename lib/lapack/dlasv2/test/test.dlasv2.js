/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlasv2 from './../lib/dlasv2.js';


// TESTS //

test( 'dlasv2 is a function', function t() {
	assert.strictEqual( typeof dlasv2, 'function', 'is a function' );
});

test( 'dlasv2 has expected arity', function t() {
	assert.strictEqual( dlasv2.length, 9, 'has expected arity' );
});
