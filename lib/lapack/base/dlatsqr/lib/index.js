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
* Computes a blocked Tall-Skinny QR (TSQR) factorization of a real `M`-by-`N` matrix (with `M >= N`).
*
* ## Notes
*
* -   The factorization is appropriate for tall-skinny matrices where `M >> N`. The first row block of size `mb`-by-`N` is factored via `dgeqrt`; subsequent row blocks are combined into the running `R` factor via `dtpqrt`.
* -   `T` has dimensions `nb`-by-`(N * Number_of_row_blocks)` where `Number_of_row_blocks = ceil((M-N)/(mb-N))`. When `mb <= N` or `mb >= M`, the routine simply calls `dgeqrt` and `T` is `nb`-by-`N`.
* -   The orthogonal factor `Q` is represented implicitly by the Householder reflectors stored below the diagonal of `A` together with `T`; use `dgemqrt` (or a future `dlamtsqr`) to apply `Q` or `Q^T`.
*
* @module @rreusser/blahpack/lapack/base/dlatsqr
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlatsqr from '@rreusser/blahpack/lapack/base/dlatsqr';
*
* var A = new Float64Array( [ 5.0, 1.0, 0.5, 0.3, 1.0, 6.0, 0.5, 0.5 ] );
* var T = new Float64Array( 4 );
* var WORK = new Float64Array( 4 );
*
* var info = dlatsqr( 'column-major', 4, 2, 8, 2, A, 4, T, 2, WORK );
* // returns 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlatsqr from './dlatsqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlatsqr, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlatsqr & { ndarray: typeof ndarray }} */ ( dlatsqr );
export { ndarray };
