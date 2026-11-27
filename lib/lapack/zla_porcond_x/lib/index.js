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
* Estimates the infinity norm condition number for a Hermitian positive-definite matrix with x scaling.
*
* ## Notes
*
* -   `A` and `AF` are `Complex128Array` matrices storing a Hermitian positive-definite matrix and its Cholesky factor (from `zpotrf`).
* -   `WORK` must have length at least `2*N` complex elements; `RWORK` must have length at least `N`.
* -   `X` is applied as an elementwise diagonal scaling of `A`.
*
* @module @rreusser/blahpack/lapack/zla_porcond_x
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zla_porcond_x from '@rreusser/blahpack/lapack/zla_porcond_x';
*
* // A = [ 4, 2; 2, 3 ] and its upper Cholesky factor AF (U = [ 2, 1; 0, sqrt(2) ]):
* var A = new Complex128Array( [ 4, 0, 2, 0, 2, 0, 3, 0 ] );
* var AF = new Complex128Array( [ 2, 0, 2, 0, 1, 0, 1.4142135623730951, 0 ] );
* var X = new Complex128Array( [ 2, 0, 1, 0 ] );
* var WORK = new Complex128Array( 4 );
* var RWORK = new Float64Array( 2 );
*
* // 1 / || inv(A)*diag(|A|*|x|) ||_inf = 1/6
* var rcond = zla_porcond_x( 'column-major', 'upper', 2, A, 2, AF, 2, X, 1, WORK, RWORK );
* // returns ~0.166667
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_porcond_x from './zla_porcond_x.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_porcond_x, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zla_porcond_x & { ndarray: typeof ndarray }} */ ( zla_porcond_x );
export { ndarray };
