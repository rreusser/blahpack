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
* Converts the factorization output format used in `zsytrf_rook` to or from the `zsytrf_rk` format for a complex symmetric matrix.
*
* @module @rreusser/blahpack/lapack/base/zsyconvf_rook
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zsyconvf_rook from '@rreusser/blahpack/lapack/base/zsyconvf_rook';
*
* var A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 3.0, 0.5, 2.0, 0.0 ] );
* var E = new Complex128Array( 2 );
* var IPIV = new Int32Array( [ -1, -1 ] );
*
* zsyconvf_rook.ndarray( 'upper', 'convert', 2, A, 1, 2, 0, E, 1, 0, IPIV, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsyconvf_rook from './zsyconvf_rook.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsyconvf_rook, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zsyconvf_rook & { ndarray: typeof ndarray }} */ ( zsyconvf_rook );
export { ndarray };
