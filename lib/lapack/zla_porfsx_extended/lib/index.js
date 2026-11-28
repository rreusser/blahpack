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
* Improves the computed solution using extra-precise iterative refinement for Hermitian positive-definite matrices.
*
* ## Notes
*
* -   This port does not implement the XBLAS extra-precision residual variants (`BLAS_ZHEMV_X`, `BLAS_ZHEMV2_X`). The `prec_type` parameter is accepted for API parity but all residual paths compute the base-precision residual via `zhemv`.
* -   On entry, `Y` must contain the initial solution computed by `zpotrs` from the Cholesky factor stored in `AF`.
*
* @module @rreusser/blahpack/lapack/zla_porfsx_extended
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import zla_porfsx_extended from '@rreusser/blahpack/lapack/zla_porfsx_extended';
*
* var A = new Complex128Array([ 4.0, 0.0, 1.0, -1.0, 0.0, 0.0, 1.0, 1.0, 3.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 2.0, 0.0 ]);
* var B = new Complex128Array([ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ]);
* var AF = new Complex128Array( A.length );
* var Y = new Complex128Array( B.length );
* var c = new Float64Array([ 1.0, 1.0, 1.0 ]);
* var RES = new Complex128Array( 3 );
* var DY = new Complex128Array( 3 );
* var YT = new Complex128Array( 3 );
* var AYB = new Float64Array( 3 );
* var berr = new Float64Array( 1 );
* var ebn = new Float64Array( 3 );
* var ebc = new Float64Array( 3 );
*
* zla_porfsx_extended.strided( 1, 'upper', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, false, c, 1, 0, B, 1, 3, 0, Y, 1, 3, 0, berr, 1, 0, 2, ebn, 1, 1, 0, ebc, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1.0, 10, 0.5, 0.25, false );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_porfsx_extended from './zla_porfsx_extended.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zla_porfsx_extended, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zla_porfsx_extended & { strided: typeof strided }} */ ( zla_porfsx_extended );
export { strided };
