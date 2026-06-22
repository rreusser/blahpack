/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlas2 from './../lib/dlas2.js';


// TESTS //

test( 'dlas2 is a function', function t() {
	assert.strictEqual( typeof dlas2, 'function', 'is a function' );
});

test( 'dlas2 has expected arity', function t() {
	assert.strictEqual( dlas2.length, 4, 'has expected arity' );
});
