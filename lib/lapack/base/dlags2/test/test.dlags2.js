/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlags2 from './../lib/dlags2.js';


// TESTS //

test( 'dlags2 is a function', function t() {
	assert.strictEqual( typeof dlags2, 'function', 'is a function' );
});

test( 'dlags2 has expected arity', function t() {
	assert.strictEqual( dlags2.length, 13, 'has expected arity' );
});
