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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsaupd from './../lib/index.js';

// Compute the 3 largest eigenvalues of the 10x10 1-D Laplacian (OP = A, B = I):
const n = 10;
const A = new Float64Array( n * n );
let i;
for ( i = 0; i < n; i++ ) {
	A[ i + ( i * n ) ] = 2.0;
	if ( i < n - 1 ) {
		A[ i + ( ( i + 1 ) * n ) ] = -1.0;
		A[ ( i + 1 ) + ( i * n ) ] = -1.0;
	}
}

const ncv = 6;
const ldv = n;
const V = new Float64Array( ldv * ncv );
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

// Reverse-communication loop; info=1 signals a user-supplied initial residual.
let info = 1;
let p, q, r, c, acc;
do {
	info = dsaupd( state, ido, 'standard', n, 'LM', 3, 0.0, resid, ncv, V, ldv, iparam, ipntr, workd, workl, lworkl, info );
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

console.log( 'info: %d, iterations: %d, converged: %d', info, iparam[ 2 ], iparam[ 4 ] ); // eslint-disable-line no-console
console.log( 'largest Ritz values:', [ workl[ ipntr[ 5 ] - 1 ], workl[ ipntr[ 5 ] ], workl[ ipntr[ 5 ] + 1 ] ] ); // eslint-disable-line no-console
