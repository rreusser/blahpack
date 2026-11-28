
/* eslint-disable no-restricted-syntax, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlarfb_gett from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarfb_gett, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dlarfb_gett.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity (13)', function t() {
	assert.strictEqual( dlarfb_gett.length, 13, 'has expected arity' );
});

test( 'strided method has expected arity (20)', function t() {
	assert.strictEqual( dlarfb_gett.strided.length, 20, 'strided has expected arity' ); // eslint-disable-line max-len
});
