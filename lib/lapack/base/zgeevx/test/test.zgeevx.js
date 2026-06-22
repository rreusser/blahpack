/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zgeevx from './../lib/zgeevx.js';


// TESTS //

test( 'zgeevx is a function', function t() {
	assert.strictEqual( typeof zgeevx, 'function', 'is a function' );
});
