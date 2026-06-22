/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlarfgp from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarfgp, 'function', 'main export is a function' );
	assert.strictEqual( dlarfgp.length, 7, 'main export has BLAS-style arity 7' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlarfgp.ndarray, 'function', 'has ndarray method' );
	assert.strictEqual( dlarfgp.ndarray.length, 8, 'ndarray has arity 8' );
});

test( 'main and ndarray are distinct functions', function t() {
	assert.notStrictEqual( dlarfgp, dlarfgp.ndarray, 'ndarray is distinct from main' ); // eslint-disable-line max-len
});
