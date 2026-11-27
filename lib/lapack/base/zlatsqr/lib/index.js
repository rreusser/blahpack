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
* Computes a blocked Tall-Skinny QR (TSQR) factorization of a complex `M`-by-`N` matrix (with `M >= N`).
*
* @module @rreusser/blahpack/lapack/base/zlatsqr
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlatsqr from '@rreusser/blahpack/lapack/base/zlatsqr';
*
* var A = new Complex128Array( [ 5.0, 0.0, 1.0, 0.0, 0.5, 0.0, 0.3, 0.0, 1.0, 0.0, 6.0, 0.0, 0.5, 0.0, 0.5, 0.0 ] );
* var T = new Complex128Array( 4 );
* var WORK = new Complex128Array( 4 );
*
* var info = zlatsqr( 'column-major', 4, 2, 8, 2, A, 4, T, 2, WORK );
* // returns 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlatsqr from './zlatsqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlatsqr, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlatsqr & { ndarray: typeof ndarray }} */ ( zlatsqr );
export { ndarray };
