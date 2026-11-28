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
* Performs the matrix-matrix multiplication `C = A * B`, where `A` is an `M`-by-`M` real matrix and `B` is an `M`-by-`N` complex matrix.
*
* ## Notes
*
* -   `zlarcm` exploits the fact that `A` is purely real by extracting the real and imaginary parts of `B` separately and applying `dgemm` twice. The `RWORK` array provides scratch space for this decomposition and must hold at least `2*M*N` real values.
*
* @module @rreusser/blahpack/lapack/zlarcm
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import zlarcm from '@rreusser/blahpack/lapack/zlarcm';
*
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, -1.0, 1.0 ] );
* var C = new Complex128Array( 4 );
* var RWORK = new Float64Array( 8 );
*
* zlarcm( 'column-major', 2, 2, A, 2, B, 2, C, 2, RWORK );
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import zlarcm from '@rreusser/blahpack/lapack/zlarcm';
*
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, -1.0, 1.0 ] );
* var C = new Complex128Array( 4 );
* var RWORK = new Float64Array( 8 );
*
* zlarcm.ndarray( 2, 2, A, 1, 2, 0, B, 1, 2, 0, C, 1, 2, 0, RWORK, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarcm from './zlarcm.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarcm, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlarcm & { ndarray: typeof ndarray }} */ ( zlarcm );
export { ndarray };
