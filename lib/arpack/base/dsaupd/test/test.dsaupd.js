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
import dsaupd from './../lib/dsaupd.js';


// TESTS //

test( 'dsaupd is a function', function t() {
	assert.strictEqual( typeof dsaupd, 'function', 'is a function' );
});

test( 'dsaupd has expected arity', function t() {
	assert.strictEqual( dsaupd.length, 17, 'has expected arity' );
});

test( 'dsaupd throws TypeError for invalid bmat', function t() {
	assert.throws( function throws() {
		dsaupd( {}, new Int32Array( 1 ), 'X', 6, 'LM', 2, 0.0, new Float64Array( 6 ), 4, new Float64Array( 24 ), 6, new Int32Array( 11 ), new Int32Array( 11 ), new Float64Array( 18 ), new Float64Array( 48 ), 48, 0 );
	}, TypeError );
});

test( 'dsaupd throws TypeError for invalid which', function t() {
	assert.throws( function throws() {
		dsaupd( {}, new Int32Array( 1 ), 'standard', 6, 'XY', 2, 0.0, new Float64Array( 6 ), 4, new Float64Array( 24 ), 6, new Int32Array( 11 ), new Int32Array( 11 ), new Float64Array( 18 ), new Float64Array( 48 ), 48, 0 );
	}, TypeError );
});

test( 'dsaupd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsaupd( {}, new Int32Array( 1 ), 'standard', -1, 'LM', 2, 0.0, new Float64Array( 6 ), 4, new Float64Array( 24 ), 6, new Int32Array( 11 ), new Int32Array( 11 ), new Float64Array( 18 ), new Float64Array( 48 ), 48, 0 );
	}, RangeError );
});

test( 'dsaupd main API converges to the largest eigenvalue of a 6x6 Laplacian', function t() {
	const n = 6;
	const A = new Float64Array( n * n );
	for ( let i = 0; i < n; i++ ) {
		A[ i + ( i * n ) ] = 2.0;
		if ( i < n - 1 ) {
			A[ i + ( ( i + 1 ) * n ) ] = -1.0;
			A[ ( i + 1 ) + ( i * n ) ] = -1.0;
		}
	}
	const ncv = 5;
	const ldv = n;
	const V = new Float64Array( ldv * ncv );
	const resid = new Float64Array( n );
	for ( let r = 0; r < n; r++ ) {
		resid[ r ] = 1.0 + ( 0.1 * ( r + 1 ) );
	}
	const workd = new Float64Array( 3 * n );
	const lworkl = ( ncv * ncv ) + ( 8 * ncv );
	const workl = new Float64Array( lworkl );
	const iparam = new Int32Array( 11 );
	iparam[ 0 ] = 1;
	iparam[ 2 ] = 100;
	iparam[ 6 ] = 1;
	const ipntr = new Int32Array( 11 );
	const ido = new Int32Array( 1 );
	const state = {};
	let info = 1;
	let guard = 0;
	while ( guard++ < 100000 ) {
		info = dsaupd( state, ido, 'standard', n, 'LM', 1, 0.0, resid, ncv, V, ldv, iparam, ipntr, workd, workl, lworkl, info );
		if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
			const p = ipntr[ 0 ];
			const q = ipntr[ 1 ];
			for ( let r = 0; r < n; r++ ) {
				let acc = 0.0;
				for ( let c = 0; c < n; c++ ) {
					acc += A[ r + ( c * n ) ] * workd[ p + c ];
				}
				workd[ q + r ] = acc;
			}
		} else {
			break;
		}
	}
	assert.strictEqual( info, 0, 'info is 0' );
	assert.strictEqual( ido[ 0 ], 99, 'ido is 99' );
	assert.strictEqual( iparam[ 4 ], 1, 'one converged Ritz value' );

	// Largest eigenvalue of the 6x6 1-D Laplacian is 2 - 2*cos( 6*pi/7 ):
	const expected = 2.0 - ( 2.0 * Math.cos( 6.0 * Math.PI / 7.0 ) );
	const ritz = workl[ ipntr[ 5 ] - 1 ];
	assert.ok( Math.abs( ritz - expected ) < 1e-10, 'largest Ritz value ' + ritz + ' matches ' + expected );
});
