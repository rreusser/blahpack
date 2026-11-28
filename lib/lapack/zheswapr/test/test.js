
/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zheswapr from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zheswapr, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zheswapr.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main and strided export are distinct functions', function t() {
	assert.notStrictEqual( zheswapr, zheswapr.strided, 'main and strided are distinct' ); // eslint-disable-line max-len
});
