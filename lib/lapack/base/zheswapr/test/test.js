
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zheswapr from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zheswapr, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zheswapr.ndarray, 'function', 'has ndarray method' ); // eslint-disable-line max-len
});

test( 'main and ndarray export are distinct functions', function t() {
	assert.notStrictEqual( zheswapr, zheswapr.ndarray, 'main and ndarray are distinct' ); // eslint-disable-line max-len
});
