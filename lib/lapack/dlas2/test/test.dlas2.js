/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlas2 from './../lib/dlas2.js';


// TESTS //

test( 'dlas2 is a function', function t() {
	assert.strictEqual( typeof dlas2, 'function', 'is a function' );
});

test( 'dlas2 has expected arity', function t() {
	assert.strictEqual( dlas2.length, 5, 'has expected arity' );
});
