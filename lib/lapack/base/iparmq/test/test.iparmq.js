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
import iparmq from './../lib/iparmq.js';


// TESTS //

test( 'iparmq is a function', function t() {
	assert.strictEqual( typeof iparmq, 'function', 'is a function' );
});

test( 'iparmq has expected arity', function t() {
	assert.strictEqual( iparmq.length, 6, 'has expected arity' );
});

test( 'iparmq returns the reference tuning values', function t() {
	assert.strictEqual( iparmq( 12, 'DLAQR0', 'SV', 100, 1, 100 ), 75, 'INMIN' );
	assert.strictEqual( iparmq( 14, 'DLAQR0', 'SV', 100, 1, 100 ), 14, 'INIBL' );
	assert.strictEqual( iparmq( 15, 'DLAQR0', 'SV', 100, 1, 100 ), 10, 'ISHFTS' );
	assert.strictEqual( iparmq( 17, 'DLAQZ0', 'SV', 100, 1, 100 ), 10, 'ICOST' );
	assert.strictEqual( iparmq( 18, 'DLAQR0', 'SV', 100, 1, 100 ), -1, 'invalid ISPEC' );
});
