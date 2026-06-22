/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgerfs from './../lib/zgerfs.js';


// TESTS //

test( 'zgerfs is a function', function t() {
	assert.strictEqual( typeof zgerfs, 'function', 'is a function' );
});

test( 'zgerfs has expected arity', function t() {
	assert.strictEqual( zgerfs.length, 2, 'has expected arity' );
});
