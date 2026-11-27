/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaln2 from './../lib/dlaln2.js';


// TESTS //

test( 'dlaln2 is a function', function t() {
	assert.strictEqual( typeof dlaln2, 'function', 'is a function' );
});

test( 'dlaln2 has expected arity', function t() {
	assert.strictEqual( dlaln2.length, 18, 'has expected arity' );
});
