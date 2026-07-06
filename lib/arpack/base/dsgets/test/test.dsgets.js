/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsgets from './../lib/dsgets.js';


// TESTS //

test( 'dsgets is a function', function t() {
	assert.strictEqual( typeof dsgets, 'function', 'is a function' );
});

test( 'dsgets has expected arity', function t() {
	assert.strictEqual( dsgets.length, 10, 'has expected arity' );
});

test( 'dsgets throws TypeError for invalid which', function t() {
	assert.throws( function throws() {
		dsgets( 1, 'XX', 2, 1, new Float64Array( 3 ), 1, new Float64Array( 3 ), 1, new Float64Array( 1 ), 1 );
	}, TypeError );
});

test( 'dsgets main API sorts by LM and selects shifts', function t() {
	var ritz = new Float64Array( [ 3.0, -1.0, 4.0, -1.5, 2.0 ] );
	var bounds = new Float64Array( [ 0.1, 0.5, 0.02, 0.3, 0.05 ] );
	var shifts = new Float64Array( 2 );
	dsgets( 1, 'LM', 3, 2, ritz, 1, bounds, 1, shifts, 1 );
	// Sorted by magnitude ascending:
	assert.strictEqual( ritz[ 0 ], -1.0, 'ritz[0]' );
	assert.strictEqual( ritz[ 4 ], 4.0, 'ritz[4]' );
	assert.strictEqual( shifts[ 0 ], -1.0, 'shifts[0]' );
	assert.strictEqual( shifts[ 1 ], -1.5, 'shifts[1]' );
});
