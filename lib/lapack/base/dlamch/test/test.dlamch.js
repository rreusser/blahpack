/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable no-restricted-syntax */

'use strict';

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlamch from './../lib/dlamch.js';


// TESTS //

test( 'dlamch is a function', function t() {
	assert.strictEqual( typeof dlamch, 'function', 'is a function' );
});

test( 'dlamch has expected arity', function t() {
	assert.strictEqual( dlamch.length, 1, 'has expected arity' );
});

test( 'dlamch returns a finite, positive epsilon', function t() {
	const eps = dlamch( 'epsilon' );
	assert.strictEqual( typeof eps, 'number', 'returns a number' );
	assert.ok( eps > 0 && Number.isFinite( eps ), 'is finite and positive' );
	assert.ok( Math.abs( eps - 1.1102230246251565e-16 ) < 1e-24, 'matches machine epsilon' );
});

test( 'dlamch throws TypeError when the machine parameter is not one of the canonical strings (ticket 0092)', function t() {
	const values = [ 5, null, void 0, true, {}, [ 'epsilon' ], 'e', 'E', 'Epsilon', 'scale', 'X' ];
	let i;
	for ( i = 0; i < values.length; i++ ) {
		assert.throws( function throws() {
			dlamch( values[ i ] );
		}, {
			'name': 'TypeError',
			'message': /^invalid argument\. First argument must be one of the following: "epsilon", .*\. Value: `/
		}, 'throws for ' + String( values[ i ] ) );
	}
});
