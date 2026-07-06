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
import dsband from './../lib/index.js';

// Compute the 4 smallest eigenvalues of the 1-D FEM generalized problem
// K x = lambda M x, with K the Laplacian and M a consistent mass matrix,
// both stored in LAPACK band form (kl = ku = 1):
var n = 50;
var nev = 4;
var ncv = 10;
var lda = 4; // 2*kl + ku + 1
var kl = 1;
var ku = 1;
var idiag = kl + ku + 1;
var isup = kl + ku;
var isub = kl + ku + 2;

var AB = new Float64Array( lda * n );
var MB = new Float64Array( lda * n );
var h = 1.0 / ( n + 1 );
var r1 = 4.0 / 6.0;
var r2 = 1.0 / 6.0;
var j;
for ( j = 1; j <= n; j++ ) {
	AB[ ( idiag-1 ) + ( (j-1)*lda ) ] = 2.0 / h;
	MB[ ( idiag-1 ) + ( (j-1)*lda ) ] = r1 * h;
}
for ( j = 1; j <= n-1; j++ ) {
	AB[ ( isup-1 ) + ( j*lda ) ] = -1.0 / h;
	AB[ ( isub-1 ) + ( (j-1)*lda ) ] = -1.0 / h;
	MB[ ( isup-1 ) + ( j*lda ) ] = r2 * h;
	MB[ ( isub-1 ) + ( (j-1)*lda ) ] = r2 * h;
}

var RFAC = new Float64Array( lda * n );
var V = new Float64Array( n * ncv );
var d = new Float64Array( ncv );
var resid = new Float64Array( n );
var i;
for ( i = 0; i < n; i++ ) {
	resid[ i ] = 1.0 + ( 0.1 * ( i+1 ) );
}
var workd = new Float64Array( 3 * n );
var lworkl = ( ncv*ncv ) + ( 8*ncv );
var workl = new Float64Array( lworkl );
var iparam = new Int32Array( 11 );
iparam[ 2 ] = 300; // max iterations
iparam[ 6 ] = 3; // shift-invert mode
var iwork = new Int32Array( n );
var select = new Int32Array( ncv );

// which='LM' with sigma=0 targets the smallest generalized eigenvalues:
var info = dsband( true, 'all', select, d, V, n, 0.0, n, AB, MB, lda, RFAC, kl, ku, 'LM', 'generalized', nev, 0.0, resid, ncv, V, n, iparam, workd, workl, lworkl, iwork, 1 );

console.log( 'info: %d, converged: %d', info, iparam[ 4 ] ); // eslint-disable-line no-console
console.log( 'smallest eigenvalues:', Array.prototype.slice.call( d, 0, nev ) ); // eslint-disable-line no-console
console.log( 'exact (k*pi)^2:', [ 1, 2, 3, 4 ].map( function sq( k ) { // eslint-disable-line no-console
	return k * k * Math.PI * Math.PI;
}) );
