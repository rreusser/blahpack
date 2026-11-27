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
* Converts a complex double precision matrix to a complex single precision matrix.
*
* @module @rreusser/blahpack/lapack/base/zlag2c
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlag2c from '@rreusser/blahpack/lapack/base/zlag2c';
*
* var A = new Complex128Array( [ 1.5, -2.25, 3.125, 4.0, -0.5, 0.75, 100.0, -200.0 ] );
* var SA = new Complex128Array( 4 );
*
* var info = zlag2c( 'column-major', 2, 2, A, 2, SA, 2 );
* // returns 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlag2c from './zlag2c.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlag2c, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlag2c & { ndarray: typeof ndarray }} */ ( zlag2c );
export { ndarray };
