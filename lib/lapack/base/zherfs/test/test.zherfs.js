/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zherfs from './../lib/zherfs.js';


// TESTS //

test( 'zherfs is a function', function t() {
	assert.strictEqual( typeof zherfs, 'function', 'is a function' );
});

test( 'zherfs has expected arity', function t() {
	assert.strictEqual( zherfs.length, 2, 'has expected arity' );
});
