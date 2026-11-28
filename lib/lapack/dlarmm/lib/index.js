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
* Compute a safe BLAS-style constant for scaling matrix norms.
*
* ## Notes
*
* -   See LAPACK reference documentation for full algorithmic details.
*
* @module @rreusser/blahpack/lapack/dlarmm
*
*
* @example
* import dlarmm from '@rreusser/blahpack/lapack/dlarmm';
*
* dlarmm( 1.0, 1.0, 1.0 );
* dlarmm( 1e308, 1.0, 1e307 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarmm from './dlarmm.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarmm, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlarmm & { ndarray: typeof ndarray }} */ ( dlarmm );
export { ndarray };
