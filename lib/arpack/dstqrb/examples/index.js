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
import dstqrb from './../lib/base.js';

// Symmetric tridiagonal matrix with diagonal 2 and subdiagonal -1:
const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
const e = new Float64Array( [ -1.0, -1.0, -1.0 ] );
const Z = new Float64Array( 4 );
const WORK = new Float64Array( 6 );

// Compute the eigenvalues and the last row of the eigenvector matrix:
const info = dstqrb( 4, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );

console.log( info ); // eslint-disable-line no-console
// => 0

console.log( d ); // eslint-disable-line no-console
// => <Float64Array>[ ~0.382, ~1.382, ~2.618, ~3.618 ]

console.log( Z ); // eslint-disable-line no-console
// => last row of the orthonormal eigenvector matrix
