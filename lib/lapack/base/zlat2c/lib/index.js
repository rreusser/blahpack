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
* Converts a double-complex triangular matrix to a single-complex triangular matrix with overflow checking.
*
* ## Notes
*
* -   The single-precision overflow threshold is IEEE 754 binary32's `RMAX` (approximately `3.4028e+38`). If any referenced entry of `A` has a real or imaginary part outside `[-RMAX, RMAX]`, the routine returns `1` and leaves the referenced triangle of `SA` in an unspecified state.
* -   Each real and imaginary component is rounded independently via `Math.fround`.
*
* @module @rreusser/blahpack/lapack/base/zlat2c
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Complex64Array from '@stdlib/array/complex64/lib/index.js';
* import zlat2c from '@rreusser/blahpack/lapack/base/zlat2c';
*
* var A = new Complex128Array( 4 );
* A.set( [ 1.0, 2.0 ], 0 );
* A.set( [ 3.0, 4.0 ], 2 );
* A.set( [ 5.0, 6.0 ], 3 );
*
* var SA = new Complex64Array( 4 );
* var info = zlat2c( 'column-major', 'upper', 2, A, 2, SA, 2 );
* // returns 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlat2c from './zlat2c.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlat2c, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlat2c & { ndarray: typeof ndarray }} */ ( zlat2c );
export { ndarray };
