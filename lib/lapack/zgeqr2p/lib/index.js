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
* Compute a QR factorization of a complex matrix with non-negative real diagonal elements (unblocked algorithm).
*
* ## Notes
*
* -   `zgeqr2p` is identical to `zgeqr2` except that the diagonal elements of `R` are guaranteed to be real and non-negative.
*
* @module @rreusser/blahpack/lapack/zgeqr2p
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgeqr2p from '@rreusser/blahpack/lapack/zgeqr2p';
*
* var A = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var TAU = new Complex128Array( [ 1.0, 2.0 ] );
* var WORK = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 ] );
*
* zgeqr2p( 'row-major', 2, 2, A, 2, TAU, 1, WORK, 1 );
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgeqr2p from '@rreusser/blahpack/lapack/zgeqr2p';
*
* var A = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var TAU = new Complex128Array( [ 1.0, 2.0 ] );
* var WORK = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 ] );
*
* zgeqr2p.ndarray( 2, 2, A, 1, 2, 0, TAU, 1, 0, WORK, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeqr2p from './zgeqr2p.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgeqr2p, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zgeqr2p & { ndarray: typeof ndarray }} */ ( zgeqr2p );
export { ndarray };
