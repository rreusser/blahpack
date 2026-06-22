
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zla_gbrfsx_extended from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_gbrfsx_extended, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zla_gbrfsx_extended.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main export and ndarray variant are distinct functions', function t() {
	assert.notStrictEqual( zla_gbrfsx_extended, zla_gbrfsx_extended.ndarray, 'distinct functions' ); // eslint-disable-line max-len
});
