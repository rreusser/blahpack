/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaed5 from './../lib/dlaed5.js';


// TESTS //

test( 'dlaed5 is a function', function t() {
	assert.strictEqual( typeof dlaed5, 'function', 'is a function' );
});

test( 'dlaed5 has expected arity', function t() {
	assert.strictEqual( dlaed5.length, 9, 'has expected arity' );
});
