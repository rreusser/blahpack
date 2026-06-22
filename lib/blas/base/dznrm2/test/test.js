/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dznrm2 from './../lib/base.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dznrm2, 'function', 'main export is a function' );
});

