/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamrg from './../lib/dlamrg.js';


// TESTS //

test( 'dlamrg is a function', function t() {
	assert.strictEqual( typeof dlamrg, 'function', 'is a function' );
});

test( 'dlamrg has expected arity', function t() {
	assert.strictEqual( dlamrg.length, 8, 'has expected arity' );
});
