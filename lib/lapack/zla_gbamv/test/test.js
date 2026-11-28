/* eslint-disable no-restricted-syntax, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zla_gbamv from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_gbamv, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zla_gbamv.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity', function t() {
	assert.strictEqual( zla_gbamv.length, 14, 'main export arity' );
});

test( 'strided method has expected arity', function t() {
	assert.strictEqual( zla_gbamv.strided.length, 17, 'strided arity' );
});
