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
* Estimates the Skeel condition number for a general banded matrix.
*
* ## Notes
*
* -   The routine requires a pre-factored matrix from `dgbtrf`. Both the original band matrix `AB` and the factored matrix `AFB` with pivot indices `IPIV` must be provided.
* -   `cmode` controls how the scaling vector `c` is applied: `1` for column scaling, `0` for no scaling, `-1` for inverse scaling.
* -   `WORK` must have at least `5*N` elements. `IWORK` must have at least `N` elements.
*
* @module @rreusser/blahpack/lapack/base/dla_gbrcond
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dgbtrf from '@rreusser/blahpack/lapack/base/dgbtrf';
* import dla_gbrcond from '@rreusser/blahpack/lapack/base/dla_gbrcond';
*
* var AB = new Float64Array( [ 0.0, 2.0, 1.0, 3.0, 5.0, 4.0, 6.0, 8.0, 0.0 ] );
* var AFB = new Float64Array( [ 0.0, 0.0, 2.0, 1.0, 0.0, 3.0, 5.0, 4.0, 0.0, 6.0, 8.0, 0.0 ] );
* var IPIV = new Int32Array( 3 );
* var c = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var WORK = new Float64Array( 15 );
* var IWORK = new Int32Array( 3 );
*
* // A = [ 2 3 0; 1 5 6; 0 4 8 ] in band storage (kl = ku = 1); factor a copy:
* dgbtrf( 'column-major', 3, 3, 1, 1, AFB, 4, IPIV, 1 );
*
* // Reciprocal of the Skeel condition number of A*diag(c), here 1/175:
* var rcond = dla_gbrcond( 'column-major', 'no-transpose', 3, 1, 1, AB, 3, AFB, 4, IPIV, 1, 1, c, 1, WORK, IWORK );
* // returns ~0.0057142857
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_gbrcond from './dla_gbrcond.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dla_gbrcond, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dla_gbrcond & { ndarray: typeof ndarray }} */ ( dla_gbrcond );
export { ndarray };
