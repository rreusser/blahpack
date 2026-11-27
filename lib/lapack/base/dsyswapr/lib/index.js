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
* Applies an elementary permutation to a symmetric matrix.
*
* @module @rreusser/blahpack/lapack/base/dsyswapr
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dsyswapr from '@rreusser/blahpack/lapack/base/dsyswapr';
*
* var A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ] );
*
* dsyswapr( 'column-major', 'upper', 3, A, 3, 0, 2 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsyswapr from './dsyswapr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsyswapr, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dsyswapr & { ndarray: typeof ndarray }} */ ( dsyswapr );
export { ndarray };
