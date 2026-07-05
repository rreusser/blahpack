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
import dseigt from './../lib/base.js';

// Symmetric tridiagonal H (diagonal 2, subdiagonal -1) in 2-column layout.
// Column 0 (rows 1..N-1) is the subdiagonal; column 1 is the main diagonal.
var H = new Float64Array( [ 0.0, -1.0, -1.0, -1.0, 2.0, 2.0, 2.0, 2.0 ] );
var eig = new Float64Array( 4 );
var bounds = new Float64Array( 4 );
var workl = new Float64Array( 12 );

// Eigenvalues of H and Ritz estimates ( rnorm * |last eigenvector component| ):
var ierr = dseigt( 0.5, 4, H, 1, 4, 0, eig, 1, 0, bounds, 1, 0, workl, 1, 0 );

console.log( ierr ); // eslint-disable-line no-console
// => 0

console.log( eig ); // eslint-disable-line no-console
// => <Float64Array>[ ~0.382, ~1.382, ~2.618, ~3.618 ]

console.log( bounds ); // eslint-disable-line no-console
// => Ritz estimates
