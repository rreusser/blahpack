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
* Computes, for a pair of N-by-N complex matrices (A, B), the generalized.
* eigenvalues and, optionally, the left and/or right generalized eigenvectors,
* with optional balancing.
*
* @module @rreusser/blahpack/lapack/base/zggevx
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zggevx from './zggevx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zggevx, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zggevx & { ndarray: typeof ndarray }} */ ( zggevx );
export { ndarray };
