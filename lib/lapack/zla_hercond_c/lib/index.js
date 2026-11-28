/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable camelcase */

/**
* Estimates the infinity norm condition number for a Hermitian indefinite matrix with inverse-c scaling.
*
* ## Notes
*
* -   The routine assumes that `A` is a Hermitian indefinite matrix whose upper or lower triangle is stored in column-major order. Only the triangle indicated by `uplo` is referenced; the diagonal entries are treated as real.
* -   `AF` must contain the Bunch-Kaufman factorization produced by `zhetrf`, and `IPIV` must hold the associated pivot indices.
* -   When `capply` is `true`, the routine estimates the reciprocal infinity-norm condition number of `A * inv(diag(C))`; otherwise, it estimates the reciprocal infinity-norm condition number of `A` (the scaling vector `C` is ignored).
* -   `WORK` must have length at least `2*N` complex elements, and `RWORK` must have length at least `N` real elements.
*
* @module @rreusser/blahpack/lapack/zla_hercond_c
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zhetrf from '@rreusser/blahpack/lapack/zhetrf';
* import zla_hercond_c from '@rreusser/blahpack/lapack/zla_hercond_c';
*
* var N = 1;
* var A = new Complex128Array( [ 5.0, 0.0 ] );
* var AF = new Complex128Array( [ 5.0, 0.0 ] );
* var IPIV = new Int32Array( [ 1 ] );
* var c = new Float64Array( [ 2.0 ] );
* var WORK = new Complex128Array( 2 );
* var RWORK = new Float64Array( 1 );
*
* zhetrf( 'column-major', 'upper', N, AF, N, IPIV );
*
* var rcond = zla_hercond_c( 'column-major', 'upper', N, A, N, AF, N, IPIV, 1, 0, c, 1, true, WORK, 1, RWORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_hercond_c from './zla_hercond_c.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zla_hercond_c, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zla_hercond_c & { strided: typeof strided }} */ ( zla_hercond_c );
export { strided };
