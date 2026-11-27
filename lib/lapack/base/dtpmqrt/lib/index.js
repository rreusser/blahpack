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
* Applies a real orthogonal matrix `Q` (or its transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `dtpqrt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* ## Notes
*
* -   The pentagonal `V` is composed of an `(M-L)`-by-`K` (left) or `(N-L)`-by-`K` (right) rectangular block stacked on top of an `L`-by-`K` upper trapezoidal block (the first `L` rows of a `K`-by-`K` upper triangular matrix).
* -   The `WORK` buffer should provide at least `N*nb` elements (`side='left'`) or `M*nb` elements (`side='right'`). If the buffer is too small, an internal scratch array is allocated automatically.
* -   `V` and `T` must come from a prior call to `dtpqrt` with the same block size `nb` and the same value of `L`.
*
* @module @rreusser/blahpack/lapack/base/dtpmqrt
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dtpmqrt from '@rreusser/blahpack/lapack/base/dtpmqrt';
*
* // ... (see examples/index.js)
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtpmqrt from './dtpmqrt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtpmqrt, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dtpmqrt & { ndarray: typeof ndarray }} */ ( dtpmqrt );
export { ndarray };
