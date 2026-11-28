/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zpftrs from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zpftrs, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zpftrs.strided, 'function', 'has strided method' );
});
