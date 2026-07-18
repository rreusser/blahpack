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
import dstqrb from './../lib/dstqrb.js';


// TESTS //

test( 'dstqrb is a function', function t() {
	assert.strictEqual( typeof dstqrb, 'function', 'is a function' );
});

test( 'dstqrb has expected arity', function t() {
	assert.strictEqual( dstqrb.length, 9, 'has expected arity' );
});

test( 'dstqrb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dstqrb( -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 8 ), 1 );
	}, RangeError );
});

test( 'dstqrb main API matches ndarray on a simple case', function t() {
	const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
	const e = new Float64Array( [ -1.0, -1.0, -1.0 ] );
	const Z = new Float64Array( 4 );
	const WORK = new Float64Array( 6 );
	const info = dstqrb( 4, d, 1, e, 1, Z, 1, WORK, 1 );
	assert.strictEqual( info, 0, 'info is 0' );
	// Eigenvalues 2 - 2*cos( k*pi/5 ), ascending:
	assert.ok( Math.abs( d[ 0 ] - 0.3819660112501051 ) < 1e-12, 'smallest eigenvalue' );
	assert.ok( Math.abs( d[ 3 ] - 3.618033988749895 ) < 1e-12, 'largest eigenvalue' );
});
