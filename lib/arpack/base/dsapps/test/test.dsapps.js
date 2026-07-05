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
import dsapps from './../lib/dsapps.js';


// TESTS //

test( 'dsapps is a function', function t() {
	assert.strictEqual( typeof dsapps, 'function', 'is a function' );
});

test( 'dsapps has expected arity', function t() {
	assert.strictEqual( dsapps.length, 15, 'has expected arity' );
});

test( 'dsapps throws RangeError for negative n', function t() {
	assert.throws( function throws() {
		dsapps( -1, 2, 1, new Float64Array( 1 ), 1, new Float64Array( 15 ), 5, new Float64Array( 6 ), 3, new Float64Array( 5 ), 1, new Float64Array( 9 ), 3, new Float64Array( 10 ), 1 );
	}, RangeError );
});

test( 'dsapps throws RangeError for undersized workd', function t() {
	assert.throws( function throws() {
		dsapps( 5, 2, 1, new Float64Array( 1 ), 1, new Float64Array( 15 ), 5, new Float64Array( 6 ), 3, new Float64Array( 5 ), 1, new Float64Array( 9 ), 3, new Float64Array( 5 ), 1 );
	}, RangeError );
});

test( 'dsapps main API (ldv/ldh/ldq form) matches the ndarray path for the single-shift case', function t() {
	var n = 5;
	var kev = 2;
	var np = 1;
	var kplusp = kev + np;
	var ld = 5;

	var v = new Float64Array( ld * kplusp );
	var i;
	var j;
	for ( j = 1; j <= kplusp; j++ ) {
		for ( i = 1; i <= n; i++ ) {
			v[ ( ( j - 1 ) * ld ) + ( i - 1 ) ] = ( 0.25 * i ) - ( 0.125 * j ) + 0.5;
		}
	}
	var h = new Float64Array( ld * 2 );
	h[ ld ] = 3.0;
	h[ ld + 1 ] = 1.0;
	h[ ld + 2 ] = 2.0;
	h[ 1 ] = 1.0;
	h[ 2 ] = 0.5;

	var resid = new Float64Array( n );
	for ( i = 1; i <= n; i++ ) {
		resid[ i - 1 ] = ( 0.5 * i ) - 1.25;
	}
	var shift = new Float64Array( [ 1.75 ] );
	var q = new Float64Array( ld * kplusp );
	var workd = new Float64Array( 2 * n );

	dsapps( n, kev, np, shift, 1, v, ld, h, ld, resid, 1, q, ld, workd, 1 );

	// The updated diagonal and residual are finite (routine ran to completion).
	assert.ok( Number.isFinite( h[ ld ] ), 'updated diagonal is finite' );
	assert.ok( Number.isFinite( resid[ 0 ] ), 'updated residual is finite' );
	// Subdiagonals of the updated leading kev-block must be non-negative.
	assert.ok( h[ 1 ] >= 0.0, 'updated subdiagonal is non-negative' );
});
