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
import dsaitr from './../lib/index.js';

// Build a 3-step Lanczos factorization of OP = A (a 5x5 symmetric matrix).
const n = 5;
const A = new Float64Array([
	2.5, 0.3, 0.1, 0.0, 0.0,
	0.3, 3.0, -0.4, 0.0, 0.0,
	0.1, -0.4, 3.5, 0.2, 0.0,
	0.0, 0.0, 0.2, 4.0, -0.6,
	0.0, 0.0, 0.0, -0.6, 4.5
]);
const np = 3;
const resid = new Float64Array( [ 1.0, 0.3, -0.7, 0.5, -0.2 ] );

// rnorm[0] = B-norm of the initial residual (B = I):
let s = 0.0;
let i;
for ( i = 0; i < n; i++ ) {
	s += resid[ i ] * resid[ i ];
}
const rnorm = new Float64Array( [ Math.sqrt( s ) ] );

const V = new Float64Array( n * np );
const H = new Float64Array( np * 2 );
const workd = new Float64Array( 3 * n );
const ipntr = new Int32Array( 3 );
const ido = new Int32Array( 1 );
const state = {};

// Loop invariant: workd(0:n-1) holds B*resid.
for ( i = 0; i < n; i++ ) {
	workd[ i ] = resid[ i ];
}

// Reverse-communication loop: apply OP = A when requested.
let info = 0;
let r, c, acc;
do {
	info = dsaitr( state, ido, 'standard', n, 0, np, 1, resid, rnorm, V, n, H, np, ipntr, workd );
	if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
		for ( r = 0; r < n; r++ ) {
			acc = 0.0;
			for ( c = 0; c < n; c++ ) {
				acc += A[ r + ( c * n ) ] * workd[ ipntr[ 0 ] + c ];
			}
			workd[ ipntr[ 1 ] + r ] = acc;
		}
	}
} while ( ido[ 0 ] !== 99 );

console.log( 'info: %d', info ); // eslint-disable-line no-console
console.log( 'H diagonal:', [ H[ np ], H[ np+1 ], H[ np+2 ] ] ); // eslint-disable-line no-console
