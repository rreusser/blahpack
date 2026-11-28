/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsyconv from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsyconv, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dsyconv.strided, 'function', 'has strided method' );
});
