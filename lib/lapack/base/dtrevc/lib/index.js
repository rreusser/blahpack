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
* @module @rreusser/blahpack/lapack/base/dtrevc
*
* @example
* import dtrevc from '@rreusser/blahpack/lapack/base/dtrevc';
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
