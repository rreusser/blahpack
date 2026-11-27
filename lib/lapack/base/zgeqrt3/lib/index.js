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
* Recursively computes a QR factorization of a complex `M`-by-`N` matrix using the compact WY representation of `Q`.
*
* @module @rreusser/blahpack/lapack/base/zgeqrt3
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgeqrt3 from '@rreusser/blahpack/lapack/base/zgeqrt3';
*
* var A = new Complex128Array( [ 2.0, 0.1, 0.7, -0.3, 0.5, 0.3, -1.0, 0.4, 1.5, -0.2, 3.0, 0.5, 1.1, -0.4, 0.4, 0.2 ] );
* var T = new Complex128Array( 4 );
*
* zgeqrt3( 'column-major', 4, 2, A, 4, T, 2 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeqrt3 from './zgeqrt3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgeqrt3, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zgeqrt3 & { ndarray: typeof ndarray }} */ ( zgeqrt3 );
export { ndarray };
