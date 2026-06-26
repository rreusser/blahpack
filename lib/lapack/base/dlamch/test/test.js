/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlamch from './../lib/base.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlamch, 'function', 'main export is a function' );
});
