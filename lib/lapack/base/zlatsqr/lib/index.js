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
* Computes a blocked Tall-Skinny QR (TSQR) factorization of a complex `M`-by-`N` matrix (with `M >= N`).
*
* ## Notes
*
* -   The factorization is appropriate for tall-skinny complex matrices where `M >> N`. The first row block of size `mb`-by-`N` is factored via `zgeqrt`; subsequent row blocks are combined into the running `R` factor via `ztpqrt`.
* -   `T` has dimensions `nb`-by-`(N * Number_of_row_blocks)` where `Number_of_row_blocks = ceil((M-N)/(mb-N))`. When `mb <= N` or `mb >= M`, the routine simply calls `zgeqrt` and `T` is `nb`-by-`N`.
* -   The unitary factor `Q` is represented implicitly by the Householder reflectors stored below the diagonal of `A` together with `T`; use `zgemqrt` (or a future `zlamtsqr`) to apply `Q` or `Q^H`.
*
* @module @rreusser/blahpack/lapack/base/zlatsqr
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlatsqr from '@rreusser/blahpack/lapack/base/zlatsqr';
*
* var A = new Complex128Array( [ 5.0, 0.0, 1.0, 0.0, 0.5, 0.0, 0.3, 0.0, 1.0, 0.0, 6.0, 0.0, 0.5, 0.0, 0.5, 0.0 ] );
* var T = new Complex128Array( 4 );
* var WORK = new Complex128Array( 4 );
*
* var info = zlatsqr( 'column-major', 4, 2, 8, 2, A, 4, T, 2, WORK );
* // returns 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlatsqr.ndarray" }
