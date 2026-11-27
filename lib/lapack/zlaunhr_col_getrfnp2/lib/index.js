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
* Computes the modified LU factorization without pivoting of a complex general M-by-N matrix (recursive kernel).
*
* ## Notes
*
* -   The factorization has the form `A - S = L*U`, where `S` is a diagonal sign matrix with `D(i) = -sign(Re(A(i,i)))` (after `i-1` Gaussian elimination steps). Because `|D(i,i)| = 1`, no pivoting is needed for stability.
* -   `A` is overwritten with the unit-lower-triangular factor `L` (below the diagonal) and the upper triangular factor `U` (on and above the diagonal). The diagonal entries of `U` are stored negated.
* -   This is an auxiliary routine used by `zunhr_col` for Householder reconstruction.
*
* @module @rreusser/blahpack/lapack/zlaunhr_col_getrfnp2
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlaunhr_col_getrfnp2 from '@rreusser/blahpack/lapack/zlaunhr_col_getrfnp2';
*
* var A = new Complex128Array( [ 0.5, 0.3, 0.2, -0.1, -0.3, 0.2, -0.1, 0.4, 0.6, -0.2, 0.1, 0.3, 0.2, -0.3, -0.4, 0.1, 0.5, 0.2 ] );
* var D = new Complex128Array( 3 );
*
* zlaunhr_col_getrfnp2( 'column-major', 3, 3, A, 3, D, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaunhr_col_getrfnp2 from './zlaunhr_col_getrfnp2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaunhr_col_getrfnp2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlaunhr_col_getrfnp2 & { ndarray: typeof ndarray }} */ ( zlaunhr_col_getrfnp2 );
export { ndarray };
