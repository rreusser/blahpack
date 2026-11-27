/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaed6 from './../lib/dlaed6.js';


// TESTS //

test( 'dlaed6 is a function', function t() {
	assert.strictEqual( typeof dlaed6, 'function', 'is a function' );
});

test( 'dlaed6 has expected arity', function t() {
	assert.strictEqual( dlaed6.length, 9, 'has expected arity' );
});
