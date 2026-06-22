/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zporfs from './../lib/zporfs.js';


// TESTS //

test( 'zporfs is a function', function t() {
	assert.strictEqual( typeof zporfs, 'function', 'is a function' );
});

test( 'zporfs has expected arity', function t() {
	assert.strictEqual( zporfs.length, 2, 'has expected arity' );
});
