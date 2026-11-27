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
* Converts a double precision matrix to a single precision matrix.
*
* ## Notes
*
* -   The routine returns `info = 1` as soon as an element is found whose magnitude exceeds the IEEE 754 binary32 overflow threshold (approximately `3.4028e+38`). In that case, elements visited prior to the offending element have already been written to `SA`.
*
* @module @rreusser/blahpack/lapack/dlag2s
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlag2s from '@rreusser/blahpack/lapack/dlag2s';
*
* var A = new Float64Array( [ 1.25, 2.5, -3.75, 4.125 ] );
* var SA = new Float64Array( 4 );
*
* var info = dlag2s( 'column-major', 2, 2, A, 2, SA, 2 );
* // returns 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlag2s from './dlag2s.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlag2s, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlag2s & { ndarray: typeof ndarray }} */ ( dlag2s );
export { ndarray };
