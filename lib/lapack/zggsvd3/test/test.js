/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zggsvd3 from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zggsvd3, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zggsvd3.strided, 'function', 'has strided method' );
});

test( 'main export and strided method are distinct functions', function t() {
	assert.notStrictEqual( zggsvd3, zggsvd3.strided, 'main export and strided method are distinct' ); // eslint-disable-line max-len
});
