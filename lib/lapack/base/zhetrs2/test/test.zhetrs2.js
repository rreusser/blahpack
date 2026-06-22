/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhetrs2 from './../lib/zhetrs2.js';


// TESTS //

test( 'zhetrs2 is a function', function t() {
	assert.strictEqual( typeof zhetrs2, 'function', 'is a function' );
});

test( 'zhetrs2 has expected arity', function t() {
	assert.strictEqual( zhetrs2.length, 4, 'has expected arity' );
});
