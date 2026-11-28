
/* eslint-disable no-restricted-syntax, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zla_syamv from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_syamv, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zla_syamv.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity (11)', function t() {
	assert.strictEqual( zla_syamv.length, 11, 'has expected arity' );
});

test( 'strided method has expected arity (14)', function t() {
	assert.strictEqual( zla_syamv.strided.length, 14, 'has expected arity' );
});
