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
* Reduces a complex M-by-N (M <= N) upper trapezoidal matrix to upper triangular form via unitary RZ factorization (blocked driver).
*
* ## Notes
*
* -   This is the blocked driver for the complex RZ factorization. The unblocked kernel `zlatrz` is invoked for the trailing columns; for sufficiently large `M` (`M > 128`), block reflectors are formed and applied via `zlarzt`/`zlarzb`.
* -   The reflectors are stored in the "Z-form": each `H(i) = I - tau(i) * v(i) * v(i)**H` has a length-`(N-M+1)` vector `v(i)` consisting of a leading `1` (implicit) followed by `N-M` non-trivial entries stored in row `i` of `A` from column `M` to `N-1`.
* -   The function returns `0` on success.
*
* @module @rreusser/blahpack/lapack/ztzrzf
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztzrzf from './ztzrzf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztzrzf, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof ztzrzf & { ndarray: typeof ndarray }} */ ( ztzrzf );
export { ndarray };
