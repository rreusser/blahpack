/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlasd5 from './../lib/dlasd5.js';


// TESTS //

test( 'dlasd5 is a function', function t() {
	assert.strictEqual( typeof dlasd5, 'function', 'is a function' );
});

test( 'dlasd5 has expected arity', function t() {
	assert.strictEqual( dlasd5.length, 10, 'has expected arity' );
});
