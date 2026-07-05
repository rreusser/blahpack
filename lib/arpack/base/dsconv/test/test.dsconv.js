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
import dsconv from './../lib/dsconv.js';


// TESTS //

test( 'dsconv is a function', function t() {
	assert.strictEqual( typeof dsconv, 'function', 'is a function' );
});

test( 'dsconv has expected arity', function t() {
	assert.strictEqual( dsconv.length, 6, 'has expected arity' );
});

test( 'dsconv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsconv( -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 1.0e-6 );
	}, RangeError );
});
