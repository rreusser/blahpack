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
* Tests whether a symmetric tridiagonal matrix warrants expensive computations for high relative accuracy.
*
* ## Notes
*
* -   The function returns `0` if the matrix may be relatively robust, indicating that expensive computations guaranteeing high relative accuracy in eigenvalues are warranted. It returns `1` if standard methods should be used instead.
* -   The routine checks whether `sqrt(|d(i)|)` is sufficiently large and whether the accumulated off-diagonal ratios remain below a threshold (`RELCOND = 0.999`).
*
* @module @rreusser/blahpack/lapack/dlarrr
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlarrr from '@rreusser/blahpack/lapack/dlarrr';
*
* var d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
* var e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
*
* var info = dlarrr( 5, d, 1, e, 1 );
* // returns 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarrr from './dlarrr.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dlarrr, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dlarrr & { strided: typeof strided }} */ ( dlarrr );
export { strided };
