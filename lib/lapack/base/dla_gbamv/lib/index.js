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
* Performs a matrix-vector operation to calculate error bounds on banded matrices.
*
* ## Notes
*
* -   Computes `y := alpha*|A|*|x| + beta*|y|` where `A` is stored in LAPACK band format with `kl` sub-diagonals and `ku` super-diagonals. Used as a building block for backward error estimation in iterative refinement routines.
*
* @module @rreusser/blahpack/lapack/base/dla_gbamv
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dla_gbamv from '@rreusser/blahpack/lapack/base/dla_gbamv';
*
* var AB = new Float64Array( [ 0.0, 1.0, 3.0, -2.0, 4.0, -6.0, -5.0, 7.0, -9.0, 8.0, 10.0, 0.0 ] );
* var x = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
* var y = new Float64Array( 4 );
*
* dla_gbamv( 'column-major', 'no-transpose', 4, 4, 1, 1, 1.0, AB, 3, x, 1, 0.0, y, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_gbamv from './dla_gbamv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dla_gbamv, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dla_gbamv & { ndarray: typeof ndarray }} */ ( dla_gbamv );
export { ndarray };
