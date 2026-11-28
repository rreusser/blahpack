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
* ## Notes
*
* -   On exit, `A` is overwritten by the generalized Schur form and `B` by the corresponding upper-triangular matrix.
* -   Strides and offsets for `A`, `B`, `ALPHA`, `BETA`, `VL`, `VR` are in complex elements.
*
* @module @rreusser/blahpack/lapack/zggevx
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zggevx from './zggevx.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zggevx, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zggevx & { strided: typeof strided }} */ ( zggevx );
export { strided };
