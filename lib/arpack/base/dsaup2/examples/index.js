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
import dsaup2 from './../lib/index.js';

// Compute the 3 largest eigenvalues of the 10x10 1-D Laplacian (OP = A):
var n = 10;
var A = new Float64Array( n * n );
var i;
for ( i = 0; i < n; i++ ) {
	A[ i + ( i * n ) ] = 2.0;
	if ( i < n - 1 ) {
		A[ i + ( ( i + 1 ) * n ) ] = -1.0;
		A[ ( i + 1 ) + ( i * n ) ] = -1.0;
	}
}

var LD = 12;
var kplusp = 6;
var resid = new Float64Array( n );
for ( i = 0; i < n; i++ ) {
	resid[ i ] = 1.0 + ( 0.1 * ( i + 1 ) );
}
var V = new Float64Array( LD * kplusp );
var H = new Float64Array( LD * 2 );
var Q = new Float64Array( LD * kplusp );
var ritz = new Float64Array( kplusp );
var bounds = new Float64Array( kplusp );
var workl = new Float64Array( 3 * kplusp );
var workd = new Float64Array( 3 * n );
var ipntr = new Int32Array( 3 );
var ido = new Int32Array( 1 );
var nev = new Int32Array( [ 3 ] );
var np = new Int32Array( [ 3 ] );
var mxiter = new Int32Array( [ 100 ] );
var state = {};

// Reverse-communication loop; info=1 signals a user-supplied initial residual.
var info = 1;
var p;
var q;
var r;
var c;
var acc;
do {
	info = dsaup2( state, ido, 'standard', n, 'LM', nev, np, 0.0, resid, 1, 1, 1, mxiter, V, LD, H, LD, ritz, bounds, Q, LD, workl, ipntr, workd, info );
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

console.log( 'info: %d, iterations: %d', info, mxiter[ 0 ] ); // eslint-disable-line no-console
console.log( 'largest Ritz values:', [ ritz[ 0 ], ritz[ 1 ], ritz[ 2 ] ] ); // eslint-disable-line no-console
