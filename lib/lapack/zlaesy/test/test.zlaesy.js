/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlaesy from './../lib/zlaesy.js';


// TESTS //

test( 'zlaesy is a function', function t() {
	assert.strictEqual( typeof zlaesy, 'function', 'is a function' );
});

test( 'zlaesy has expected arity', function t() {
	assert.strictEqual( zlaesy.length, 8, 'has expected arity' );
});
