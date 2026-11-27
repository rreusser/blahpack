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
* Applies an elementary permutation to a complex Hermitian matrix.
*
* ## Notes
*
* -   Diagonal elements are assumed to be real and remain real after the permutation.
* -   The "middle" swap across the diagonal conjugates each pair to preserve Hermitian structure, and the single corner element `A(i1,i2)` is conjugated once more as a fix-up (mirroring the reference Fortran `DCONJG` step).
*
* @module @rreusser/blahpack/lapack/base/zheswapr
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zheswapr from '@rreusser/blahpack/lapack/base/zheswapr';
*
* var A = new Complex128Array( [ 1, 0, 2, 1, 3, 2, 2, -1, 4, 0, 5, 1, 3, -2, 5, -1, 6, 0 ] );
* zheswapr( 'column-major', 'upper', 3, A, 3, 0, 2 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zheswapr.ndarray" }
