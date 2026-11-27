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
* Applies a real orthogonal matrix `Q` (or its transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `dtplqt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* @module @rreusser/blahpack/lapack/base/dtpmlqt
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dtpmlqt from '@rreusser/blahpack/lapack/base/dtpmlqt';
*
* // ... (see examples/index.js)
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtpmlqt from './dtpmlqt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtpmlqt, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dtpmlqt & { ndarray: typeof ndarray }} */ ( dtpmlqt );
export { ndarray };
