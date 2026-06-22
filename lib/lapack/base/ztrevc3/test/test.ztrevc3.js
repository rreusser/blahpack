/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrevc3 from './../lib/ztrevc3.js';


// TESTS //

test( 'ztrevc3 is a function', function t() {
	assert.strictEqual( typeof ztrevc3, 'function', 'is a function' );
});

test( 'ztrevc3 has expected arity', function t() {
	assert.strictEqual( ztrevc3.length, 2, 'has expected arity' );
});
