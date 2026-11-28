
/* eslint-disable no-restricted-syntax, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dla_gbamv from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dla_gbamv, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dla_gbamv.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity (14)', function t() {
	assert.strictEqual( dla_gbamv.length, 14, 'has expected arity' );
});

test( 'strided method has expected arity (17)', function t() {
	assert.strictEqual( dla_gbamv.strided.length, 17, 'strided has expected arity' ); // eslint-disable-line max-len
});
