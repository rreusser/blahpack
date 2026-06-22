/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztbrfs from './../lib/ztbrfs.js';


// TESTS //

test( 'ztbrfs is a function', function t() {
	assert.strictEqual( typeof ztbrfs, 'function', 'is a function' );
});

test( 'ztbrfs has expected arity', function t() {
	assert.strictEqual( ztbrfs.length, 1, 'has expected arity' );
});
