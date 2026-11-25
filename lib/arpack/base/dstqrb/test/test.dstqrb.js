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
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'dstqrb is a function', function t() {
	assert.strictEqual( typeof dstqrb, 'function', 'is a function' );
});

test( 'dstqrb has expected arity', function t() {
	assert.strictEqual( dstqrb.length, 8, 'has expected arity' );
});

test( 'dstqrb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dstqrb( -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 8 ) );
	}, RangeError );
});

test( 'dstqrb main API matches ndarray on a simple case', function t() {
	const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
	const e = new Float64Array( [ -1.0, -1.0, -1.0 ] );
	const Z = new Float64Array( 4 );
	const WORK = new Float64Array( 6 );
	const info = dstqrb( 4, d, 1, e, 1, Z, 1, WORK );
	assert.strictEqual( info, 0, 'info is 0' );
	// Eigenvalues 2 - 2*cos( k*pi/5 ), ascending:
	assert.ok( Math.abs( d[ 0 ] - 0.3819660112501051 ) < 1e-12, 'smallest eigenvalue' );
	assert.ok( Math.abs( d[ 3 ] - 3.618033988749895 ) < 1e-12, 'largest eigenvalue' );
});

test( 'dstqrb allocates WORK when it is null (ticket 0074)', function t() {
	const d1 = new Float64Array( [ 4.0, 1.0, 3.0, 2.0 ] );
	const e1 = new Float64Array( [ -1.0, 0.5, -0.25 ] );
	const z1 = new Float64Array( 4 );
	const d2 = new Float64Array( d1 );
	const e2 = new Float64Array( e1 );
	const z2 = new Float64Array( 4 );
	let i;

	const i1 = ndarray( 4, d1, 1, 0, e1, 1, 0, z1, 1, 0, new Float64Array( 6 ), 1, 0 );
	const i2 = dstqrb( 4, d2, 1, e2, 1, z2, 1, null );
	assert.strictEqual( i2, i1, 'info' );
	for ( i = 0; i < 4; i++ ) {
		assert.strictEqual( d2[ i ], d1[ i ], 'd[' + i + ']' );
		assert.strictEqual( z2[ i ], z1[ i ], 'Z[' + i + ']' );
	}
});
