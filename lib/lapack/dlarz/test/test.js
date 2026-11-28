/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlarz from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarz, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dlarz.strided, 'function', 'has strided method' );
});

test( 'main and strided exports differ', function t() {
	assert.notStrictEqual( dlarz, dlarz.strided, 'main and strided are distinct functions' ); // eslint-disable-line max-len
});
