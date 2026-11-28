
/* eslint-disable no-restricted-syntax */


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

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dggevx.strided, 'function', 'has strided method' );
	assert.ok( dggevx.strided, 'strided method is truthy' );
	assert.notStrictEqual( dggevx.strided, dggevx, 'strided is distinct from main' ); // eslint-disable-line max-len
});
