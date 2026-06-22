
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zla_porfsx_extended from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zla_porfsx_extended, 'function', 'main export is a function' ); // eslint-disable-line max-len
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zla_porfsx_extended.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'ndarray method is distinct from the BLAS-layout wrapper', function t() {
	assert.notStrictEqual( zla_porfsx_extended, zla_porfsx_extended.ndarray, 'distinct functions' ); // eslint-disable-line max-len
});
