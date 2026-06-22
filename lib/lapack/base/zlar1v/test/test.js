/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zlar1v from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlar1v, 'function', 'main export is a function' );
	assert.ok( zlar1v.length > 0, 'has a nonzero arity' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zlar1v.ndarray, 'function', 'has ndarray method' );
	assert.notStrictEqual( zlar1v.ndarray, zlar1v, 'ndarray is a distinct function' ); // eslint-disable-line max-len
});
