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
import dgetv0 from './../lib/index.js';

// Generate a starting vector for OP = A (a 4x4 symmetric tridiagonal), j = 1.
var N = 4;
var A = new Float64Array([
	2.0, -1.0, 0.0, 0.0,
	-1.0, 2.0, -1.0, 0.0,
	0.0, -1.0, 2.0, -1.0,
	0.0, 0.0, -1.0, 2.0
]);
var V = new Float64Array( N );
var resid = new Float64Array( N );
var workd = new Float64Array( 2 * N );
var rnorm = new Float64Array( 1 );
var ipntr = new Int32Array( 3 );
var ido = new Int32Array( 1 );
var state = {};

// Reverse-communication loop: apply OP = A whenever dgetv0 requests it.
var ierr = 0;
do {
	ierr = dgetv0( state, ido, 'standard', 1, false, N, 1, V, N, resid, rnorm, ipntr, workd );
	if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
		for ( var r = 0; r < N; r++ ) {
			var acc = 0.0;
			for ( var c = 0; c < N; c++ ) {
				acc += A[ r + ( c * N ) ] * workd[ ipntr[ 0 ] + c ];
			}
			workd[ ipntr[ 1 ] + r ] = acc;
		}
	}
} while ( ido[ 0 ] !== 99 );

console.log( 'ierr: %d', ierr ); // eslint-disable-line no-console
console.log( 'rnorm: %d', rnorm[ 0 ] ); // eslint-disable-line no-console
console.log( resid ); // eslint-disable-line no-console
