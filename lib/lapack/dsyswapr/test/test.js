
/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsyswapr from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsyswapr, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dsyswapr.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main and strided export are distinct functions', function t() {
	assert.notStrictEqual( dsyswapr, dsyswapr.strided, 'main and strided are distinct' ); // eslint-disable-line max-len
});
