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
import dgetv0 from './../lib/dgetv0.js';


// TESTS //

test( 'dgetv0 is a function', function t() {
	assert.strictEqual( typeof dgetv0, 'function', 'is a function' );
});

test( 'dgetv0 has expected arity', function t() {
	assert.strictEqual( dgetv0.length, 13, 'has expected arity' );
});

test( 'dgetv0 throws TypeError for invalid bmat', function t() {
	assert.throws( function throws() {
		dgetv0( {}, new Int32Array( 1 ), 'X', 1, false, 4, 1, new Float64Array( 4 ), 4, new Float64Array( 4 ), new Float64Array( 1 ), new Int32Array( 3 ), new Float64Array( 8 ) );
	}, TypeError );
});

test( 'dgetv0 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgetv0( {}, new Int32Array( 1 ), 'standard', 1, false, -1, 1, new Float64Array( 4 ), 4, new Float64Array( 4 ), new Float64Array( 1 ), new Int32Array( 3 ), new Float64Array( 8 ) );
	}, RangeError );
});

test( 'dgetv0 main API generates a starting vector for OP=A (j=1)', function t() {
	const N = 4;
	const A = new Float64Array( [ 2.0, -1.0, 0.0, 0.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 2.0 ] );
	const V = new Float64Array( N );
	const resid = new Float64Array( N );
	const workd = new Float64Array( 2 * N );
	const rnorm = new Float64Array( 1 );
	const ipntr = new Int32Array( 3 );
	const ido = new Int32Array( 1 );
	const state = {};
	let ierr = 0;
	let guard = 0;
	let r, c, acc;
	while ( guard++ < 100 ) {
		ierr = dgetv0( state, ido, 'standard', 1, false, N, 1, V, N, resid, rnorm, ipntr, workd );
		if ( ido[ 0 ] === 99 ) {
			break;
		}
		for ( r = 0; r < N; r++ ) {
			acc = 0.0;
			for ( c = 0; c < N; c++ ) {
				acc += A[ r + ( c * N ) ] * workd[ ipntr[ 0 ] + c ];
			}
			workd[ ipntr[ 1 ] + r ] = acc;
		}
	}
	assert.strictEqual( ierr, 0, 'ierr is 0' );
	assert.strictEqual( ido[ 0 ], 99, 'ido is 99' );
	assert.ok( rnorm[ 0 ] > 0.0, 'rnorm is positive' );
});
