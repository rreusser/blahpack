/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zggsvd3 from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zggsvd3, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zggsvd3.ndarray, 'function', 'has ndarray method' );
});

test( 'main export and ndarray method are distinct functions', function t() {
	assert.notStrictEqual( zggsvd3, zggsvd3.ndarray, 'main export and ndarray method are distinct' ); // eslint-disable-line max-len
});
