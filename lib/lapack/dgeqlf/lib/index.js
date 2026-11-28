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
* Computes a QL factorization of a real general matrix.
*
* ## Notes
*
* -   The matrix `Q` is represented as a product of elementary reflectors `Q = H(k) ... H(2) H(1)` where `k = min(M, N)`. The lower trapezoidal factor `L` is stored in the bottom of `A` (rows `M-k` to `M-1`). Reflector vectors are stored in the remaining portion of `A`, and their scalar factors are stored in `TAU`.
*
* @module @rreusser/blahpack/lapack/dgeqlf
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgeqlf from '@rreusser/blahpack/lapack/dgeqlf';
*
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 ] );
* var TAU = new Float64Array( 3 );
* var WORK = new Float64Array( 3 );
*
* dgeqlf( 'column-major', 3, 3, A, 3, TAU, 1, WORK, 1, 3 );
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgeqlf from '@rreusser/blahpack/lapack/dgeqlf';
*
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 ] );
* var TAU = new Float64Array( 3 );
* var WORK = new Float64Array( 3 );
*
* dgeqlf.strided( 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0, 3 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeqlf from './dgeqlf.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dgeqlf, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dgeqlf & { strided: typeof strided }} */ ( dgeqlf );
export { strided };
