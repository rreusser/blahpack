/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zhseqr from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zhseqr, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zhseqr.strided, 'function', 'has strided method' );
});
