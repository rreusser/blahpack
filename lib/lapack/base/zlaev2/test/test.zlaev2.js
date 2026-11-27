/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlaev2 from './../lib/zlaev2.js';


// TESTS //

test( 'zlaev2 is a function', function t() {
	assert.strictEqual( typeof zlaev2, 'function', 'is a function' );
});

test( 'zlaev2 has expected arity', function t() {
	assert.strictEqual( zlaev2.length, 7, 'has expected arity' );
});
