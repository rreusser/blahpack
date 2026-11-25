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

import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamch from './../../../../lapack/base/dlamch/lib/index.js';
import dsaupd from './../../dsaupd/lib/index.js';
import dseupd from './../lib/index.js';

// `dseupd` post-processes a converged ARPACK Lanczos factorization produced by
// `dsaupd`. First run the `dsaupd` reverse-communication loop on the 10x10
// 1-D Laplacian (OP = A, B = I) to find its 3 largest eigenvalues:
const n = 10;
const nev = 3;
const ncv = 6;
const A = new Float64Array( n * n );
let i;
for ( i = 0; i < n; i++ ) {
	A[ i + ( i * n ) ] = 2.0;
	if ( i < n - 1 ) {
		A[ i + ( ( i + 1 ) * n ) ] = -1.0;
		A[ ( i + 1 ) + ( i * n ) ] = -1.0;
	}
}

const v = new Float64Array( n * ncv );
const resid = new Float64Array( n );
for ( i = 0; i < n; i++ ) {
	resid[ i ] = 1.0 + ( 0.1 * ( i + 1 ) );
}
const workd = new Float64Array( 3 * n );
const lworkl = ( ncv * ncv ) + ( 8 * ncv );
const workl = new Float64Array( lworkl );
const iparam = new Int32Array( 11 );
iparam[ 0 ] = 1; // exact shifts
iparam[ 2 ] = 100; // max iterations
iparam[ 6 ] = 1; // mode 1
const ipntr = new Int32Array( 11 );
const ido = new Int32Array( 1 );
const state = {};
const tol = dlamch( 'epsilon' ); // relative accuracy (machine precision)

// Reverse-communication loop; info=1 signals a user-supplied initial residual.
let info = 1;
let p, q, r, c, acc;
do {
	info = dsaupd( 'column-major', state, ido, 'standard', n, 'LM', nev, tol, resid, 1, ncv, v, n, iparam, 1, ipntr, 1, workd, workl, lworkl, info );
	if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
		p = ipntr[ 0 ];
		q = ipntr[ 1 ];
		for ( r = 0; r < n; r++ ) {
			acc = 0.0;
			for ( c = 0; c < n; c++ ) {
				acc += A[ r + ( c * n ) ] * workd[ p + c ];
			}
			workd[ q + r ] = acc;
		}
	}
} while ( ido[ 0 ] !== 99 );

const select = new Uint8Array( ncv );
const d = new Float64Array( nev );
const z = new Float64Array( n * nev );

const howmny = 'all'; // compute all Ritz vectors
const bmat = 'standard'; // standard eigenproblem

// Extract the three largest eigenvalues and their Ritz vectors:
info = dseupd( 'column-major', true, howmny, select, 1, d, 1, z, n, 0.0, bmat, n, 'LM', nev, tol, resid, 1, ncv, v, n, iparam, 1, ipntr, 1, workd, workl, lworkl );

console.log( info ); // eslint-disable-line no-console
// => 0

console.log( Array.prototype.slice.call( d ) ); // eslint-disable-line no-console
// => three largest eigenvalues of the 1-D Laplacian, ascending

console.log( 'exact:', [ 8, 9, 10 ].map( function lam( k ) { // eslint-disable-line no-console
	return 2.0 - ( 2.0 * Math.cos( k * Math.PI / ( n + 1 ) ) );
}) );
