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
* Recursively computes a QR factorization of a real `M`-by-`N` matrix using the compact WY representation of `Q`.
*
* @module @rreusser/blahpack/lapack/base/dgeqrt3
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgeqrt3 from '@rreusser/blahpack/lapack/base/dgeqrt3';
*
* var A = new Float64Array( [ 2.0, 1.0, 0.5, 0.5, 3.0, 1.5 ] );
* var T = new Float64Array( 4 );
*
* dgeqrt3( 'column-major', 3, 2, A, 3, T, 2 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeqrt3 from './dgeqrt3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgeqrt3, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dgeqrt3 & { ndarray: typeof ndarray }} */ ( dgeqrt3 );
export { ndarray };
