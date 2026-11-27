/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
* Reduces a real general band matrix to upper bidiagonal form.
*
* ## Notes
*
* -   `vect` must be one of `'no-vectors'`, `'q-only'`, `'p-only'`, or `'both'` to control whether `Q` and/or `P**T` are accumulated.
* -   Band storage follows LAPACK convention: `AB(ku+1+i-j, j) = A(i,j)`, so the matrix is stored with `KL+KU+1` rows.
* -   `WORK` must have length at least `2 * max(M, N)`.
*
* @module @rreusser/blahpack/lapack/base/dgbbrd
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgbbrd from '@rreusser/blahpack/lapack/base/dgbbrd';
*
* var AB = new Float64Array([
*     0.0, 4.0, -1.0,
*     -1.0, 4.0, -1.0,
*     -1.0, 4.0, -1.0,
*     -1.0, 4.0, -1.0,
*     -1.0, 4.0, 0.0
* ]);
* var d = new Float64Array( 5 );
* var e = new Float64Array( 4 );
* var Q = new Float64Array( 1 );
* var PT = new Float64Array( 1 );
* var C = new Float64Array( 1 );
* var WORK = new Float64Array( 10 );
*
* dgbbrd( 'column-major', 'no-vectors', 5, 5, 0, 1, 1, AB, 3, d, 1, e, 1, Q, 1, PT, 1, C, 1, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dgbbrd.ndarray" }
