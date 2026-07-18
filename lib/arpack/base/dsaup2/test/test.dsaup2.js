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
import dsaup2 from './../lib/dsaup2.js';


// TESTS //

test( 'dsaup2 is a function', function t() {
	assert.strictEqual( typeof dsaup2, 'function', 'is a function' );
});

test( 'dsaup2 has expected arity', function t() {
	assert.strictEqual( dsaup2.length, 25, 'has expected arity' );
});

test( 'dsaup2 throws TypeError for invalid bmat', function t() {
	assert.throws( function throws() {
		dsaup2( {}, new Int32Array( 1 ), 'X', 4, 'LM', new Int32Array( [ 2 ] ), new Int32Array( [ 2 ] ), 0.0, new Float64Array( 4 ), 1, 1, 1, new Int32Array( [ 10 ] ), new Float64Array( 16 ), 4, new Float64Array( 8 ), 4, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 16 ), 4, new Float64Array( 12 ), new Int32Array( 3 ), new Float64Array( 12 ), 1 );
	}, TypeError );
});

test( 'dsaup2 throws TypeError for invalid which', function t() {
	assert.throws( function throws() {
		dsaup2( {}, new Int32Array( 1 ), 'standard', 4, 'XY', new Int32Array( [ 2 ] ), new Int32Array( [ 2 ] ), 0.0, new Float64Array( 4 ), 1, 1, 1, new Int32Array( [ 10 ] ), new Float64Array( 16 ), 4, new Float64Array( 8 ), 4, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 16 ), 4, new Float64Array( 12 ), new Int32Array( 3 ), new Float64Array( 12 ), 1 );
	}, TypeError );
});

test( 'dsaup2 main API converges to the largest eigenvalue of a 6x6 Laplacian', function t() {
	const n = 6;
	const A = new Float64Array( n * n );
	let i;
	for ( i = 0; i < n; i++ ) {
		A[ i + ( i * n ) ] = 2.0;
		if ( i < n - 1 ) {
			A[ i + ( ( i + 1 ) * n ) ] = -1.0;
			A[ ( i + 1 ) + ( i * n ) ] = -1.0;
		}
	}
	const LD = 6;
	const kplusp = 4;
	const resid = new Float64Array( [ 1.0, 0.5, -0.3, 0.7, -0.2, 0.9 ] );
	const V = new Float64Array( LD * kplusp );
	const H = new Float64Array( LD * 2 );
	const Q = new Float64Array( LD * kplusp );
	const ritz = new Float64Array( kplusp );
	const bounds = new Float64Array( kplusp );
	const workl = new Float64Array( 3 * kplusp );
	const workd = new Float64Array( 3 * n );
	const ipntr = new Int32Array( 3 );
	const ido = new Int32Array( 1 );
	const nev = new Int32Array( [ 2 ] );
	const np = new Int32Array( [ 2 ] );
	const mxiter = new Int32Array( [ 100 ] );
	const state = {};
	let info = 1;
	let guard = 0;
	let p, q, r, c, acc;
	while ( guard++ < 10000 ) {
		info = dsaup2( state, ido, 'standard', n, 'LM', nev, np, 0.0, resid, 1, 1, 1, mxiter, V, LD, H, LD, ritz, bounds, Q, LD, workl, ipntr, workd, info );
		if ( ido[ 0 ] === 99 ) {
			break;
		}
		p = ipntr[ 0 ];
		q = ipntr[ 1 ];
		if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
			for ( r = 0; r < n; r++ ) {
				acc = 0.0;
				for ( c = 0; c < n; c++ ) {
					acc += A[ r + ( c * n ) ] * workd[ p + c ];
				}
				workd[ q + r ] = acc;
			}
		} else if ( ido[ 0 ] === 2 ) {
			for ( r = 0; r < n; r++ ) {
				workd[ q + r ] = workd[ p + r ];
			}
		}
	}
	assert.strictEqual( info, 0, 'info is 0' );
	// Largest eigenvalue of the 6x6 [2,-1] Laplacian: 2 - 2*cos(6*pi/7) ~ 3.802:
	assert.ok( Math.abs( ritz[ nev[ 0 ] - 1 ] - 3.8019377358048383 ) < 1e-8, 'largest Ritz value' );
});
