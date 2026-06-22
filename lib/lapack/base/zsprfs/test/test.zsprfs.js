/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsprfs from './../lib/zsprfs.js';


// TESTS //

test( 'zsprfs is a function', function t() {
	assert.strictEqual( typeof zsprfs, 'function', 'is a function' );
});

test( 'zsprfs has expected arity', function t() {
	assert.strictEqual( zsprfs.length, 2, 'has expected arity' );
});
