/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable camelcase */

/**
* Compute a component-wise relative backward error.
*
* ## Notes
*
* -   `dla_lin_berr` is an auxiliary routine used by iterative refinement routines (e.g., `dla_gerfsx_extended`, `dla_porfsx_extended`).
* -   The safeguard `safe1 = (nz+1) * DLAMCH('Safe minimum')` matches the guard used in `SLA_yyAMV` when computing `AYB`, ensuring `BERR` is not inflated by spuriously zero residuals.
* -   Rows where `AYB(i,j) == 0` are skipped: if `AYB` was computed by `SLA_yyAMV`, the exact-zero denominator implies the true residual is also exactly zero.
*
* @module @rreusser/blahpack/lapack/dla_lin_berr
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dla_lin_berr from '@rreusser/blahpack/lapack/dla_lin_berr';
*
* var res = new Float64Array( [ 1e-6, 2e-6, 3e-6, 4e-6 ] );
* var ayb = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var berr = new Float64Array( 2 );
*
* dla_lin_berr( 'column-major', 2, 2, 2, res, 2, ayb, 2, berr, 1 );
* // berr => <Float64Array>[ ~1e-6, ~1e-6 ]
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dla_lin_berr from '@rreusser/blahpack/lapack/dla_lin_berr';
*
* var res = new Float64Array( [ 1e-6, 2e-6, 3e-6, 4e-6 ] );
* var ayb = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var berr = new Float64Array( 2 );
*
* dla_lin_berr.strided( 2, 2, 2, res, 1, 2, 0, ayb, 1, 2, 0, berr, 1, 0 );
* // berr => <Float64Array>[ 1e-6, 1e-6 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_lin_berr from './dla_lin_berr.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dla_lin_berr, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dla_lin_berr & { strided: typeof strided }} */ ( dla_lin_berr );
export { strided };
