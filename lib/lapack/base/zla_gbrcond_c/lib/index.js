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
* Estimates the infinity norm condition number for a complex general banded matrix with inverse-c scaling.
*
* ## Notes
*
* -   Requires a pre-factored input (`AFB` and `IPIV` from `zgbtrf`).
* -   `WORK` must have at least `2*N` complex elements. `RWORK` must have at least `N` real elements.
* -   `trans` must be `'no-transpose'` or `'conjugate-transpose'`.
* -   Returns `0` if the matrix is singular or zero.
*
* @module @rreusser/blahpack/lapack/base/zla_gbrcond_c
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zla_gbrcond_c from '@rreusser/blahpack/lapack/base/zla_gbrcond_c';
*
* var AB = new Complex128Array( [ 0, 0, 5, 0, 0, 0 ] );
* var AFB = new Complex128Array( [ 0, 0, 0, 0, 5, 0 ] );
* var IPIV = new Int32Array( [ 1 ] );
* var c = new Float64Array( [ 2.0 ] );
* var WORK = new Complex128Array( 2 );
* var RWORK = new Float64Array( 1 );
*
* var rcond = zla_gbrcond_c.ndarray( 'no-transpose', 1, 0, 0, AB, 1, 1, 1, AFB, 1, 1, 2, IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_gbrcond_c.ndarray" }
