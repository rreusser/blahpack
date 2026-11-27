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
* Applies a complex Householder block reflector to a triangular-pentagonal matrix.
*
* ## Notes
*
* -   On input, the upper-trapezoidal `K`-by-`N` block is stored in `A`; when `ident = 'not-identity'` the columns of `V1` (unit lower-triangular) occupy the strict lower triangle of `A(1:K,1:K)`. On output, `A` is overwritten by `H*A`.
* -   The reflector `V2` is stored in the first `K` columns of `B`; on output, `B` contains the rectangular product `H*B`.
* -   `WORK` must have dimension at least `K`-by-`max(K, N-K)`.
*
* @module @rreusser/blahpack/lapack/base/zlarfb_gett
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlarfb_gett from '@rreusser/blahpack/lapack/base/zlarfb_gett';
*
* var T = new Complex128Array( 4 );
* var A = new Complex128Array( 6 );
* var B = new Complex128Array( 9 );
* var WORK = new Complex128Array( 4 );
*
* zlarfb_gett.ndarray( 'identity', 3, 3, 2, T, 1, 2, 0, A, 1, 2, 0, B, 1, 3, 0, WORK, 1, 2, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarfb_gett from './zlarfb_gett.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarfb_gett, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlarfb_gett & { ndarray: typeof ndarray }} */ ( zlarfb_gett );
export { ndarray };
