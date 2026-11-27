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
* Recursively computes an LQ factorization of a complex `M`-by-`N` matrix using the compact WY representation of `Q`.
*
* @module @rreusser/blahpack/lapack/base/zgelqt3
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgelqt3 from '@rreusser/blahpack/lapack/base/zgelqt3';
*
* var A = new Complex128Array( [ 2.0, 0.1, 0.5, -0.2, 1.0, 0.3, 3.0, 0.4, 0.5, -0.1, 1.5, 0.2 ] );
* var T = new Complex128Array( 4 );
*
* zgelqt3( 'column-major', 2, 3, A, 2, T, 2 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgelqt3 from './zgelqt3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgelqt3, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zgelqt3 & { ndarray: typeof ndarray }} */ ( zgelqt3 );
export { ndarray };
