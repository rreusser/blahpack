/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dladiv from './../lib/dladiv.js';


// TESTS //

test( 'dladiv is a function', function t() {
	assert.strictEqual( typeof dladiv, 'function', 'is a function' );
});

test( 'dladiv has expected arity', function t() {
	assert.strictEqual( dladiv.length, 6, 'has expected arity' );
});
