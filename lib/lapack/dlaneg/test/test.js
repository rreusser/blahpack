/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaneg from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlaneg, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dlaneg.strided, 'function', 'has strided method' );
});

test( 'main export and strided method have the expected arities', function t() {
	assert.strictEqual( dlaneg.length, 8, 'main has arity 8' );
	assert.strictEqual( dlaneg.strided.length, 10, 'strided has arity 10' );
});
