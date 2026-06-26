
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zla_syrcond_c from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_syrcond_c, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zla_syrcond_c.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export has expected arity', function t() {
	assert.strictEqual( zla_syrcond_c.length, 17, 'has expected arity' );
});
