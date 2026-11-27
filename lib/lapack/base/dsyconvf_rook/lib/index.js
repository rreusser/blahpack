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
* Converts the factorization output format used in dsytrf_rook.
*
* ## Notes
*
* -   `way` is one of `'convert'` or `'revert'`. `'convert'` extracts the off-diagonal of the block-diagonal factor `D` from a `dsytrf_rook` factorization into `e`, zeroes those positions in `A`, then applies the row/column interchanges. `'revert'` reverses the procedure.
* -   Rook pivoting encodes each 2-by-2 pivot block by making BOTH adjacent `IPIV` entries negative. Each entry describes an independent row interchange.
*
* @module @rreusser/blahpack/lapack/base/dsyconvf_rook
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dsyconvf_rook from '@rreusser/blahpack/lapack/base/dsyconvf_rook';
*
* var A = new Float64Array( [ 1.0, 0.0, 3.0, 2.0 ] );
* var e = new Float64Array( 2 );
* var IPIV = new Int32Array( [ -1, -2 ] );
*
* dsyconvf_rook.ndarray( 'upper', 'convert', 2, A, 1, 2, 0, e, 1, 0, IPIV, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsyconvf_rook from './dsyconvf_rook.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsyconvf_rook, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dsyconvf_rook & { ndarray: typeof ndarray }} */ ( dsyconvf_rook );
export { ndarray };
