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
* Computes the factorization of a real symmetric matrix using Aasen's algorithm (blocked).
*
* ## Notes
*
* -   `IPIV` stores standard 0-based pivot indices. Aasen's algorithm does NOT use
*     the Bunch-Kaufman negative-IPIV encoding (unlike `dsytrf`, `dsytrf_rk`, or
*     `dsytrf_rook`).
* -   On exit, the symmetric tridiagonal `T` is stored on the diagonals of `A`
*     (with sub/superdiagonal stored adjacent), and `L` (or `U`) is stored below
*     (or above) the subdiagonals.
* -   The block size `NB` comes from `ilaenv` (64), as in the reference.
*
* @module @rreusser/blahpack/lapack/dsytrf_aa
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dsytrfAa from '@rreusser/blahpack/lapack/dsytrf_aa';
*
* var A = new Float64Array([ 4, 2, 1, 0, 0, 5, 2, 1, 0, 0, 6, 3, 0, 0, 0, 8 ]);
* var IPIV = new Int32Array( 4 );
*
* var info = dsytrfAa( 'column-major', 'lower', 4, A, 4, IPIV );
* // info => 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsytrfAa from './dsytrf_aa.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dsytrfAa, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dsytrfAa & { strided: typeof strided }} */ ( dsytrfAa );
export { strided };
