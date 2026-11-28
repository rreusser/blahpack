/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zsytri3x from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zsytri3x, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zsytri3x.strided, 'function', 'has strided method' ); // eslint-disable-line max-len
});

test( 'strided method is a function', function t() {
	assert.strictEqual( typeof zsytri3x.strided, 'function', 'strided method is a function' ); // eslint-disable-line max-len
});
