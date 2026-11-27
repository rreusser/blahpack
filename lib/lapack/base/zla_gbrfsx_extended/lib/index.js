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
* ## Notes
*
* -   Extended-precision residual paths (`BLAS_ZGBMV_X`, `BLAS_ZGBMV2_X`) are not available in this build; the routine always uses the standard `zgbmv` residual. The `prec_type` parameter is accepted for API compatibility but has no effect.
*
* @module @rreusser/blahpack/lapack/base/zla_gbrfsx_extended
*
* @example
* import zla_gbrfsx_extended from '@rreusser/blahpack/lapack/base/zla_gbrfsx_extended';
*
* console.log( typeof zla_gbrfsx_extended );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_gbrfsx_extended.ndarray" }
