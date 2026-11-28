/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zsyswapr from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zsyswapr, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zsyswapr.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main and strided export are distinct functions', function t() {
	assert.notStrictEqual( zsyswapr, zsyswapr.strided, 'main and strided are distinct' ); // eslint-disable-line max-len
});
