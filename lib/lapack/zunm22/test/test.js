
/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zunm22 from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zunm22, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zunm22.strided, 'function', 'has strided method' );
});

test( 'main export arity', function t() {
	assert.strictEqual( zunm22.length, 12, 'has expected arity' );
	assert.strictEqual( zunm22.strided.length, 17, 'strided has expected arity' );
});
