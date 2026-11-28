/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlarfgp from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlarfgp, 'function', 'main export is a function' );
	assert.strictEqual( zlarfgp.length, 5, 'main export has arity 7' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zlarfgp.strided, 'function', 'has strided method' );
	assert.strictEqual( zlarfgp.strided.length, 8, 'strided has arity 8' );
});

test( 'main and strided are distinct functions', function t() {
	assert.notStrictEqual( zlarfgp, zlarfgp.strided, 'strided is distinct from main' ); // eslint-disable-line max-len
});
