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
* Compute a QL factorization of a complex M-by-N matrix.
*
* ## Notes
*
* -   See LAPACK reference documentation for full algorithmic details.
*
* @module @rreusser/blahpack/lapack/zgeql2
*
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgeql2 from '@rreusser/blahpack/lapack/zgeql2';
*
* var M = 3;
* var N = 2;
* var A = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 1, 5, 1, 6, 1 ] );
* var TAU = new Complex128Array( N );
* var WORK = new Complex128Array( N );
*
* zgeql2( 'column-major', M, N, A, M, TAU, 1, WORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeql2 from './zgeql2.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zgeql2, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zgeql2 & { strided: typeof strided }} */ ( zgeql2 );
export { strided };
