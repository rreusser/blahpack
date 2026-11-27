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
* Improves the computed solution using extra-precise iterative refinement for complex banded matrices.
*
* @module @rreusser/blahpack/lapack/base/zla_gbrfsx_extended
*
* @example
* import zla_gbrfsx_extended from '@rreusser/blahpack/lapack/base/zla_gbrfsx_extended';
*
* console.log( typeof zla_gbrfsx_extended );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_gbrfsx_extended from './zla_gbrfsx_extended.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_gbrfsx_extended, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zla_gbrfsx_extended & { ndarray: typeof ndarray }} */ ( zla_gbrfsx_extended );
export { ndarray };
