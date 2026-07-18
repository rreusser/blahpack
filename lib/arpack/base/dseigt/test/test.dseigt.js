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
import dseigt from './../lib/dseigt.js';


// TESTS //

test( 'dseigt is a function', function t() {
	assert.strictEqual( typeof dseigt, 'function', 'is a function' );
});

test( 'dseigt has expected arity', function t() {
	assert.strictEqual( dseigt.length, 10, 'has expected arity' );
});

test( 'dseigt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dseigt( 0.5, -1, new Float64Array( 8 ), 4, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 12 ), 1 );
	}, RangeError );
});

test( 'dseigt main API computes Ritz estimates for the [2,-1] tridiagonal', function t() {
	const N = 4;
	const H = new Float64Array( 4 * 2 );
	let i;
	for ( i = 0; i < N; i++ ) {
		H[ i + 4 ] = 2.0;
	}
	for ( i = 1; i < N; i++ ) {
		H[ i ] = -1.0;
	}
	const eig = new Float64Array( N );
	const bounds = new Float64Array( N );
	const workl = new Float64Array( 3 * N );
	const ierr = dseigt( 0.5, N, H, 4, eig, 1, bounds, 1, workl, 1 );
	assert.strictEqual( ierr, 0, 'ierr is 0' );
	assert.ok( Math.abs( eig[ 0 ] - 0.3819660112501051 ) < 1e-12, 'smallest eigenvalue' );
	// bounds = 0.5*|last eigenvector row|; symmetric endpoints:
	assert.ok( Math.abs( bounds[ 0 ] - bounds[ 3 ] ) < 1e-12, 'symmetric Ritz estimates' );
});
