
/* eslint-disable no-restricted-syntax, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dla_syrcond from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dla_syrcond, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dla_syrcond.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity (18)', function t() {
	assert.strictEqual( dla_syrcond.length, 14, 'has expected arity' );
});

test( 'strided method has expected arity (23)', function t() {
	assert.strictEqual( dla_syrcond.strided.length, 23, 'strided has expected arity' ); // eslint-disable-line max-len
});
