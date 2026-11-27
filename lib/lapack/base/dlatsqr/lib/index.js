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
* Computes a blocked Tall-Skinny QR (TSQR) factorization of a real `M`-by-`N` matrix (with `M >= N`).
*
* @module @rreusser/blahpack/lapack/base/dlatsqr
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlatsqr from '@rreusser/blahpack/lapack/base/dlatsqr';
*
* var A = new Float64Array( [ 5.0, 1.0, 0.5, 0.3, 1.0, 6.0, 0.5, 0.5 ] );
* var T = new Float64Array( 4 );
* var WORK = new Float64Array( 4 );
*
* var info = dlatsqr( 'column-major', 4, 2, 8, 2, A, 4, T, 2, WORK );
* // returns 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlatsqr from './dlatsqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlatsqr, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlatsqr & { ndarray: typeof ndarray }} */ ( dlatsqr );
export { ndarray };
