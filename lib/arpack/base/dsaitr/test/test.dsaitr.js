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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsaitr from './../lib/dsaitr.js';


// FUNCTIONS //

function nrm2( x, n ) {
	var s = 0.0;
	var i;
	for ( i = 0; i < n; i++ ) {
		s += x[ i ] * x[ i ];
	}
	return Math.sqrt( s );
}


// TESTS //

test( 'dsaitr is a function', function t() {
	assert.strictEqual( typeof dsaitr, 'function', 'is a function' );
});

test( 'dsaitr has expected arity', function t() {
	assert.strictEqual( dsaitr.length, 15, 'has expected arity' );
});

test( 'dsaitr throws TypeError for invalid bmat', function t() {
	assert.throws( function throws() {
		dsaitr( {}, new Int32Array( 1 ), 'X', 4, 0, 2, 1, new Float64Array( 4 ), new Float64Array( 1 ), new Float64Array( 8 ), 4, new Float64Array( 4 ), 4, new Int32Array( 3 ), new Float64Array( 12 ) );
	}, TypeError );
});

test( 'dsaitr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsaitr( {}, new Int32Array( 1 ), 'standard', -1, 0, 2, 1, new Float64Array( 4 ), new Float64Array( 1 ), new Float64Array( 8 ), 4, new Float64Array( 4 ), 4, new Int32Array( 3 ), new Float64Array( 12 ) );
	}, RangeError );
});

test( 'dsaitr main API builds a 2-step factorization for OP=A', function t() {
	var n = 4;
	var A = new Float64Array( [ 2.0, -1.0, 0.0, 0.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 2.0 ] );
	var resid = new Float64Array( [ 1.0, 0.4, -0.3, 0.7 ] );
	var rnorm = new Float64Array( [ nrm2( resid, n ) ] );
	var V = new Float64Array( n * 2 );
	var H = new Float64Array( 2 * 2 );
	var workd = new Float64Array( 3 * n );
	var ipntr = new Int32Array( 3 );
	var ido = new Int32Array( 1 );
	var state = {};
	var info = 0;
	var guard = 0;
	var r;
	var c;
	var acc;
	var i;
	for ( i = 0; i < n; i++ ) {
		workd[ i ] = resid[ i ];
	}
	while ( guard++ < 200 ) {
		info = dsaitr( state, ido, 'standard', n, 0, 2, 1, resid, rnorm, V, n, H, 2, ipntr, workd );
		if ( ido[ 0 ] === 99 ) {
			break;
		}
		for ( r = 0; r < n; r++ ) {
			acc = 0.0;
			for ( c = 0; c < n; c++ ) {
				acc += A[ r + ( c * n ) ] * workd[ ipntr[ 0 ] + c ];
			}
			workd[ ipntr[ 1 ] + r ] = acc;
		}
	}
	assert.strictEqual( info, 0, 'info is 0' );
	assert.strictEqual( ido[ 0 ], 99, 'ido is 99' );
	// The first Lanczos basis vector is normalized:
	var nv = 0.0;
	for ( i = 0; i < n; i++ ) {
		nv += V[ i ] * V[ i ];
	}
	assert.ok( Math.abs( Math.sqrt( nv ) - 1.0 ) < 1e-10, 'first basis vector is normalized' );
});
