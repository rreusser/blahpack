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
* Computes some or all of the right and/or left eigenvectors of a real upper quasi-triangular matrix.
*
* ## Notes
*
* -   Workspace `WORK` must have length at least `3*N`.
* -   The matrix `T` must be in real upper quasi-triangular (Schur) form.
* -   For complex eigenvalues, eigenvectors are stored as consecutive column pairs (real part, imaginary part).
*
* @module @rreusser/blahpack/lapack/dtrevc
*
* @example
* import dtrevc from '@rreusser/blahpack/lapack/dtrevc';
*
* // See examples/index.js for usage
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtrevc from './dtrevc.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtrevc, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dtrevc & { ndarray: typeof ndarray }} */ ( dtrevc );
export { ndarray };
