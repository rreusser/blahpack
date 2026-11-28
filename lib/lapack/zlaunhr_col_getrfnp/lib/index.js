/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable camelcase */

/**
* Computes the modified LU factorization without pivoting of a complex general M-by-N matrix (blocked driver).
*
* ## Notes
*
* -   The factorization has the form `A - S = L*U`, where `S` is a diagonal sign matrix with `D(i) = -sign(Re(A(i,i)))` (after `i-1` Gaussian elimination steps). Because `|D(i,i)| = 1`, no pivoting is needed for stability.
* -   `A` is overwritten with the unit lower triangular factor `L` (below the diagonal) and the upper triangular factor `U` (on and above the diagonal).
* -   This is the blocked right-looking driver. It calls the recursive kernel `zlaunhr_col_getrfnp2` on diagonal blocks and uses `ztrsm`/`zgemm` to update the trailing submatrix. The block size is hardcoded to `NB = 32` (matching LAPACK's `ILAENV` configuration for the related `LAORHR_COL_GETRFNP` family).
* -   Used by the Householder reconstruction routine `zunhr_col`.
*
* @module @rreusser/blahpack/lapack/zlaunhr_col_getrfnp
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlaunhr_col_getrfnp from '@rreusser/blahpack/lapack/zlaunhr_col_getrfnp';
*
* var A = new Complex128Array( [ 0.5, 0.3, 0.2, -0.1, -0.3, 0.2, -0.1, 0.4, 0.6, -0.2, 0.1, 0.3, 0.2, -0.3, -0.4, 0.1, 0.5, 0.2 ] );
* var D = new Complex128Array( 3 );
*
* zlaunhr_col_getrfnp( 'column-major', 3, 3, A, 3, D, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaunhr_col_getrfnp from './zlaunhr_col_getrfnp.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zlaunhr_col_getrfnp, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zlaunhr_col_getrfnp & { strided: typeof strided }} */ ( zlaunhr_col_getrfnp );
export { strided };
