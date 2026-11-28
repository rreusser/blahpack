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
* Generates all or part of the unitary matrix Q from an RQ factorization determined by zgerqf (unblocked algorithm).
*
* ## Notes
*
* -   `zungr2` generates Q = H(1)^H \* H(2)^H \* ... \* H(K)^H, where each H(i) is an elementary reflector of the form `H(i) = I - tau(i) * v * v^H`.
* -   On entry, the last K rows of A must contain the reflector vectors as returned by `zgerqf`. On exit, A contains the M-by-N matrix Q.
*
* @module @rreusser/blahpack/lapack/zungr2
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zungr2 from '@rreusser/blahpack/lapack/zungr2';
*
* var A = new Complex128Array( 4 );
* var TAU = new Complex128Array( 1 );
* var WORK = new Complex128Array( 2 );
*
* var info = zungr2.ndarray( 2, 2, 0, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
* // info => 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zungr2 from './zungr2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zungr2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zungr2 & { ndarray: typeof ndarray }} */ ( zungr2 );
export { ndarray };
