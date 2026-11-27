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
* Improves the computed solution using extra-precise iterative refinement for complex general matrices.
*
* ## Notes
*
* -   This routine is a private helper called from `zgerfsx` to perform iterative refinement of a complex general system of linear equations.
* -   The `prec_type` argument is accepted for API compatibility but is ignored: the JavaScript build has no XBLAS (extra-precision BLAS), so all residuals are computed at base double precision.
*
* @module @rreusser/blahpack/lapack/base/zla_gerfsx_extended
*
* @example
* import zla_gerfsx_extended from '@rreusser/blahpack/lapack/base/zla_gerfsx_extended';
*
* // See `examples/index.js` for a complete usage example.
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_gerfsx_extended from './zla_gerfsx_extended.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_gerfsx_extended, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zla_gerfsx_extended & { ndarray: typeof ndarray }} */ ( zla_gerfsx_extended );
export { ndarray };
