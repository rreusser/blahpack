/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhetrs from './../lib/zhetrs.js';


// TESTS //

test( 'zhetrs is a function', function t() {
	assert.strictEqual( typeof zhetrs, 'function', 'is a function' );
});

test( 'zhetrs has expected arity', function t() {
	assert.strictEqual( zhetrs.length, 4, 'has expected arity' );
});
