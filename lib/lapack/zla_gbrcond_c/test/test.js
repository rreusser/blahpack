/* eslint-disable no-restricted-syntax, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zla_gbrcond_c from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_gbrcond_c, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zla_gbrcond_c.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity', function t() {
	assert.strictEqual( zla_gbrcond_c.length, 16, 'has expected arity' );
});

test( 'strided export has expected arity', function t() {
	assert.strictEqual( zla_gbrcond_c.strided.length, 25, 'has expected arity' );
});
