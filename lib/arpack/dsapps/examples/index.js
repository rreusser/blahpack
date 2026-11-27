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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsapps from './../lib/base.js';

// Apply a single implicit shift to a small symmetric Lanczos factorization.
const n = 5;
const kev = 2;
const np = 1;
const kplusp = kev + np;

// Arnoldi vectors V ( n by kev+np ), column-major:
const v = new Float64Array( n * kplusp );
let i;
for ( i = 0; i < v.length; i++ ) {
	v[ i ] = ( i + 1 ) * 0.1;
}

// Symmetric tridiagonal H in the ARPACK 2-column layout ( kev+np by 2 ).
// Column 0 (rows 1..kplusp-1) is the subdiagonal; column 1 is the diagonal.
const h = new Float64Array( [ 0.0, 1.0, 0.5, 3.0, 1.0, 2.0 ] );

const resid = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
const shift = new Float64Array( [ 1.75 ] );
const q = new Float64Array( kplusp * kplusp );
const workd = new Float64Array( 2 * n );

dsapps( n, kev, np, shift, 1, 0, v, 1, n, 0, h, 1, kplusp, 0, resid, 1, 0, q, 1, kplusp, 0, workd, 1, 0 );

// Updated tridiagonal H ( leading kev block is meaningful ):
console.log( h ); // eslint-disable-line no-console

// Updated residual vector:
console.log( resid ); // eslint-disable-line no-console

// Accumulated rotation matrix Q:
console.log( q ); // eslint-disable-line no-console
