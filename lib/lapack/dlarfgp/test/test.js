/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlarfgp from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarfgp, 'function', 'main export is a function' );
	assert.strictEqual( dlarfgp.length, 5, 'main export has BLAS-style arity 7' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dlarfgp.strided, 'function', 'has strided method' );
	assert.strictEqual( dlarfgp.strided.length, 8, 'strided has arity 8' );
});

test( 'main and strided are distinct functions', function t() {
	assert.notStrictEqual( dlarfgp, dlarfgp.strided, 'strided is distinct from main' ); // eslint-disable-line max-len
});
