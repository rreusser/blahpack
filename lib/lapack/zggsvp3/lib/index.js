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
* Computes unitary matrices for generalized SVD pre-processing of a complex matrix pair.
*
* ## Notes
*
* -   `jobu`, `jobv`, `jobq` accept either `'compute-U'`/`'compute-V'`/`'compute-Q'` to compute the corresponding unitary matrix, or `'none'` to skip.
* -   On exit, `K[0]` and `L[0]` hold the numerical ranks that define the GSVD block structure.
* -   `RWORK` must have length at least `2*N`; `TAU` must have length at least `min(M,N)`; `WORK` must have length `lwork` as returned by the workspace query path in reference LAPACK.
*
* @module @rreusser/blahpack/lapack/base/zggsvp3
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zggsvp3 from '@rreusser/blahpack/lapack/base/zggsvp3';
*
* var A = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
* var B = new Complex128Array( [ 5.0, 0.0, 0.0, 0.0, 0.0, 0.0, 5.0, 0.0 ] );
* var U = new Complex128Array( 4 );
* var V = new Complex128Array( 4 );
* var Q = new Complex128Array( 4 );
* var IWORK = new Int32Array( 2 );
* var RWORK = new Float64Array( 4 );
* var TAU = new Complex128Array( 2 );
* var WORK = new Complex128Array( 100 );
* var K = [ 0 ];
* var L = [ 0 ];
*
* zggsvp3.ndarray( 'compute-U', 'compute-V', 'compute-Q', 2, 2, 2, A, 1, 2, 0, B, 1, 2, 0, 1e-8, 1e-8, K, L, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, IWORK, 1, 0, RWORK, 1, 0, TAU, 1, 0, WORK, 1, 0, 100 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zggsvp3 from './zggsvp3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zggsvp3, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zggsvp3 & { ndarray: typeof ndarray }} */ ( zggsvp3 );
export { ndarray };
