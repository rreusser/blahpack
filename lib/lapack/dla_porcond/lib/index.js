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
* Estimates the Skeel condition number for a symmetric positive-definite matrix.
*
* ## Notes
*
* -   Uses the dlacn2 reverse communication interface to estimate the 1-norm of the inverse.
* -   The matrix `A` is the original symmetric positive-definite matrix, and `AF` is its Cholesky factorization computed by dpotrf.
* -   The `cmode` parameter controls scaling: 1 multiplies by `C`, 0 applies no scaling, -1 divides by `C`.
*
* @module @rreusser/blahpack/lapack/base/dla_porcond
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dla_porcond from '@rreusser/blahpack/lapack/base/dla_porcond';
*
* var A = new Float64Array( [ 4.0, 1.0, 0.5, 1.0, 5.0, 1.0, 0.5, 1.0, 6.0 ] );
* var AF = new Float64Array( [ 2.0, 0.5, 0.25, 0.5, 2.179, 0.401, 0.25, 0.401, 2.403 ] );
* var C = new Float64Array( [ 2.0, 1.0, 0.5 ] );
* var WORK = new Float64Array( 9 );
* var IWORK = new Int32Array( 3 );
*
* var result = dla_porcond.ndarray( 'upper', 3, A, 1, 3, 0, AF, 1, 3, 0, 1, C, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_porcond from './dla_porcond.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dla_porcond, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dla_porcond & { ndarray: typeof ndarray }} */ ( dla_porcond );
export { ndarray };
