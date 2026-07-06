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
import dsortr from './../lib/dsortr.js';


// TESTS //

test( 'dsortr is a function', function t() {
	assert.strictEqual( typeof dsortr, 'function', 'is a function' );
});

test( 'dsortr has expected arity', function t() {
	assert.strictEqual( dsortr.length, 7, 'has expected arity' );
});

test( 'dsortr throws TypeError for invalid which', function t() {
	assert.throws( function throws() {
		dsortr( 'XX', false, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsortr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsortr( 'LM', false, -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
