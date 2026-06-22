/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zsyrfs from './../lib/zsyrfs.js';


// TESTS //

test( 'zsyrfs is a function', function t() {
	assert.strictEqual( typeof zsyrfs, 'function', 'is a function' );
});

test( 'zsyrfs has expected arity', function t() {
	assert.strictEqual( zsyrfs.length, 2, 'has expected arity' );
});
