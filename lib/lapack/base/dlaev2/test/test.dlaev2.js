/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaev2 from './../lib/dlaev2.js';


// TESTS //

test( 'dlaev2 is a function', function t() {
	assert.strictEqual( typeof dlaev2, 'function', 'is a function' );
});

test( 'dlaev2 has expected arity', function t() {
	assert.strictEqual( dlaev2.length, 7, 'has expected arity' );
});
