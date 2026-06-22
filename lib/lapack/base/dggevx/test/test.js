
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dggevx from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dggevx, 'function', 'main export is a function' );
	assert.ok( dggevx, 'module exports something truthy' );
	assert.strictEqual( dggevx.name, 'dggevx', 'function has expected name' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dggevx.ndarray, 'function', 'has ndarray method' );
	assert.ok( dggevx.ndarray, 'ndarray method is truthy' );
	assert.notStrictEqual( dggevx.ndarray, dggevx, 'ndarray is distinct from main' ); // eslint-disable-line max-len
});
