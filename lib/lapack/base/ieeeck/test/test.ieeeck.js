/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import ieeeck from './../lib/ieeeck.js';


// TESTS //

test( 'ieeeck is a function', function t() {
	assert.strictEqual( typeof ieeeck, 'function', 'is a function' );
});

test( 'ieeeck has expected arity', function t() {
	assert.strictEqual( ieeeck.length, 3, 'has expected arity' );
});

test( 'ieeeck returns 1 for IEEE arithmetic', function t() {
	assert.strictEqual( ieeeck( 0, 0.0, 1.0 ), 1, 'infinity arithmetic' );
	assert.strictEqual( ieeeck( 1, 0.0, 1.0 ), 1, 'NaN arithmetic' );
});

test( 'ieeeck returns 0 when the arithmetic checks fail', function t() {
	assert.strictEqual( ieeeck( 1, 1.0, 1.0 ), 0, 'ONE/ZERO is not greater than ONE' );
});
