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
* Computes generalized eigenvalues and eigenvectors for a pair of real nonsymmetric matrices.
*
* ## Notes
*
* -   The generalized eigenvalues are returned as the pairs (ALPHAR(j)+i*ALPHAI(j), BETA(j)), j=1,...,N. The eigenvalue is ALPHAR(j)/BETA(j) + i*ALPHAI(j)/BETA(j) when BETA(j) is nonzero.
* -   Workspace is allocated internally; there is no LWORK parameter.
*
* @module @rreusser/blahpack/lapack/base/dggev
*
* @example
* // Compute generalized eigenvalues of a 2x2 diagonal matrix pair.
* // See README.md and tests for full usage examples.
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dggev from './dggev.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dggev, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dggev & { ndarray: typeof ndarray }} */ ( dggev );
export { ndarray };
