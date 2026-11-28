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
* Computes the eigenvalues of a real matrix pair (H,T) where H is upper Hessenberg and T is upper triangular, using the QZ method.
*
* ## Notes
*
* -   The generalized eigenvalues are `(ALPHAR(j) + i*ALPHAI(j)) / BETA(j)`, for j = 0, ..., N-1.
* -   `H` must be in upper Hessenberg form and `T` must be in upper triangular form on entry.
* -   The function returns INFO: 0 on success, j+1 if the j-th eigenvalue failed to converge, N+1 or N+2 for unexpected failures.
*
* @module @rreusser/blahpack/lapack/dhgeqz
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dhgeqz from '@rreusser/blahpack/lapack/dhgeqz';
*
* // Generalized eigenvalues of the pencil ( H, T ), H upper Hessenberg and T upper triangular (row-major):
* var H = new Float64Array( [ 2.0, 3.0, 1.5, 4.0 ] );
* var T = new Float64Array( [ 1.0, 0.5, 0.0, 2.0 ] );
* var ALPHAR = new Float64Array( 2 );
* var ALPHAI = new Float64Array( 2 );
* var BETA = new Float64Array( 2 );
* var Q = new Float64Array( 4 );
* var Z = new Float64Array( 4 );
* var WORK = new Float64Array( 2 );
*
* var info = dhgeqz( 'row-major', 'eigenvalues', 'none', 'none', 2, 0, 1, H, 2, T, 2, ALPHAR, 1, ALPHAI, 1, BETA, 1, Q, 2, Z, 2, WORK );
* // returns 0
*
* // ALPHAR / BETA are the roots of det( H - λT ) = 2λ² - 7.25λ + 3.5:
* // ALPHAR[ 0 ] / BETA[ 0 ] => ~0.5735
* // ALPHAR[ 1 ] / BETA[ 1 ] => ~3.0515
* // ALPHAI => <Float64Array>[ 0.0, 0.0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dhgeqz from './dhgeqz.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dhgeqz, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dhgeqz & { strided: typeof strided }} */ ( dhgeqz );
export { strided };
