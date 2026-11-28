
/* eslint-disable no-restricted-syntax, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zla_hercond_x from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_hercond_x, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zla_hercond_x.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity', function t() {
	assert.strictEqual( zla_hercond_x.length, 13, 'main arity is 16' );
});

test( 'strided method has expected arity', function t() {
	assert.strictEqual( zla_hercond_x.strided.length, 22, 'strided arity is 22' );
});
