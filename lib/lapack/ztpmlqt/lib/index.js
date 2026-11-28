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
* Applies a complex unitary matrix `Q` (or its conjugate transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `ztplqt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* ## Notes
*
* -   The pentagonal `V` is composed of a `K`-by-`(M-L)` (left) or `K`-by-`(N-L)` (right) rectangular block followed by a `K`-by-`L` lower-trapezoidal block (the first `L` rows of a `K`-by-`K` upper-triangular matrix). Reflectors are stored row-wise, so the block kernel `ztprfb` is invoked with `storev='rowwise'`.
* -   The `WORK` buffer should provide at least `N*mb` complex elements (`side='left'`) or `M*mb` complex elements (`side='right'`). If the buffer is too small, an internal scratch array is allocated automatically.
* -   `V` and `T` must come from a prior call to `ztplqt` with the same block size `mb` and the same value of `L`.
* -   The `trans` parameter accepts `'no-transpose'` and `'conjugate-transpose'` only. Plain `'transpose'` is rejected because `Q` is unitary, not orthogonal.
*
* @module @rreusser/blahpack/lapack/ztpmlqt
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztpmlqt from '@rreusser/blahpack/lapack/ztpmlqt';
*
* // ... (see examples/index.js)
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztpmlqt from './ztpmlqt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztpmlqt, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof ztpmlqt & { ndarray: typeof ndarray }} */ ( ztpmlqt );
export { ndarray };
