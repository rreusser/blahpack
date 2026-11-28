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
* Estimates the infinity norm condition number for a Hermitian positive-definite matrix with inverse-c scaling.
*
* ## Notes
*
* -   `A` stores the original Hermitian positive-definite N-by-N matrix; only the triangle indicated by `uplo` is referenced.
* -   `AF` holds the Cholesky factorization produced by `zpotrf` (`A = U^H*U` or `A = L*L^H`).
* -   `WORK` must have length at least `2*N` complex elements and `RWORK` at least `N`.
* -   When `capply` is `true`, `C` is applied as inverse column scaling; otherwise `C` is ignored.
*
* @module @rreusser/blahpack/lapack/zla_porcond_c
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zpotrf from '@rreusser/blahpack/lapack/zpotrf';
* import zla_porcond_c from '@rreusser/blahpack/lapack/zla_porcond_c';
*
* // A = [ 4, 2; 2, 3 ] and its Cholesky factor AF = U^H*U:
* var A = new Complex128Array( [ 4.0, 0.0, 2.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
* var AF = new Complex128Array( [ 4.0, 0.0, 2.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
* var c = new Float64Array( [ 2.0, 1.0 ] );
* var WORK = new Complex128Array( 4 );
* var RWORK = new Float64Array( 2 );
*
* var info = zpotrf( 'column-major', 'upper', 2, AF, 2 );
* // returns 0
*
* // Reciprocal Skeel condition number of A*inv(diag(c)): 1 / || diag(c)*inv(A)*diag(|A|*inv(c)) || = 1/5
* var rcond = zla_porcond_c( 'column-major', 'upper', 2, A, 2, AF, 2, c, 1, true, WORK, RWORK );
* // returns ~0.2
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_porcond_c from './zla_porcond_c.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_porcond_c, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zla_porcond_c & { ndarray: typeof ndarray }} */ ( zla_porcond_c );
export { ndarray };
