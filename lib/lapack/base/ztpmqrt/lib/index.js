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
* Applies a complex unitary matrix `Q` (or its conjugate-transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `ztpqrt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* @module @rreusser/blahpack/lapack/base/ztpmqrt
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztpmqrt from '@rreusser/blahpack/lapack/base/ztpmqrt';
*
* // ... (see examples/index.js)
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztpmqrt from './ztpmqrt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztpmqrt, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof ztpmqrt & { ndarray: typeof ndarray }} */ ( ztpmqrt );
export { ndarray };
