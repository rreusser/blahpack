
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlarfb_gett from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlarfb_gett, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zlarfb_gett.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity', function t() {
	assert.strictEqual( zlarfb_gett.length, 13, 'has expected arity' );
});
