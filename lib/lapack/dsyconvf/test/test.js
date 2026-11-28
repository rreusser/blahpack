
/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dsyconvf from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dsyconvf, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dsyconvf.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'main and strided exports are distinct functions', function t() {
	assert.notStrictEqual( dsyconvf, dsyconvf.strided, 'main and strided are distinct' ); // eslint-disable-line max-len
});
