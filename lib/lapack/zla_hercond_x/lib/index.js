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
* Estimates the infinity norm condition number for a Hermitian indefinite matrix with x scaling.
*
* ## Notes
*
* -   `WORK` must have length at least `2*N` complex elements.
* -   `RWORK` must have length at least `N` double elements.
* -   `X` is multiplied elementwise into the columns of `A` (complex vector scaling).
* -   `AF` and `IPIV` must come from a prior `zhetrf` factorization.
*
* @module @rreusser/blahpack/lapack/zla_hercond_x
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zla_hercond_x from '@rreusser/blahpack/lapack/zla_hercond_x';
*
* var A = new Complex128Array( [ 2, 0, 1, 0, 1, 0, 3, 0 ] );
* var AF = new Complex128Array( A );
* var IPIV = new Int32Array( [ 0, 1 ] );
* var X = new Complex128Array( [ 1, 0, 1, 0 ] );
* var WORK = new Complex128Array( 4 );
* var RWORK = new Float64Array( 2 );
*
* var rcond = zla_hercond_x( 'column-major', 'upper', 2, A, 2, AF, 2, IPIV, 1, 0, X, 1, WORK, 1, RWORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_hercond_x from './zla_hercond_x.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zla_hercond_x, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zla_hercond_x & { strided: typeof strided }} */ ( zla_hercond_x );
export { strided };
