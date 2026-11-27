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
* Applies an elementary permutation to a complex symmetric matrix.
*
* @module @rreusser/blahpack/lapack/base/zsyswapr
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zsyswapr from '@rreusser/blahpack/lapack/base/zsyswapr';
*
* var A = new Complex128Array( [ 1.0, 0.1, 0.0, 0.0, 0.0, 0.0, 2.0, 0.2, 4.0, 0.4, 0.0, 0.0, 3.0, 0.3, 5.0, 0.5, 6.0, 0.6 ] );
*
* zsyswapr( 'column-major', 'upper', 3, A, 3, 0, 2 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsyswapr from './zsyswapr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsyswapr, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zsyswapr & { ndarray: typeof ndarray }} */ ( zsyswapr );
export { ndarray };
