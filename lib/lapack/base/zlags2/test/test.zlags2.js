/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlags2 from './../lib/zlags2.js';


// TESTS //

test( 'zlags2 is a function', function t() {
	assert.strictEqual( typeof zlags2, 'function', 'is a function' );
});

test( 'zlags2 has expected arity', function t() {
	assert.strictEqual( zlags2.length, 13, 'has expected arity' );
});
