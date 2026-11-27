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
* Converts the factorization output format used in `zsytrf_rook` to or from the `zsytrf_rk` format for a complex symmetric matrix.
*
* ## Notes
*
* -   Converts between the `zsytrf_rook` and `zsytrf_rk` (or `zsytrf_bk`) factorization output formats for a complex symmetric matrix.
* -   `way = 'convert'` extracts the off-diagonal entries of 2x2 diagonal blocks of `D` into `E` and then applies the rook pivoting permutations to the triangular factor. `way = 'revert'` undoes both steps in reverse order.
* -   `IPIV` is used in-place and is NOT reformatted by this routine.
* -   `IPIV` is 0-based in the JavaScript API. Rook 2x2 pivots are encoded with both elements of the pair negative; decode the partner row via `~IPIV[i]`.
*
* @module @rreusser/blahpack/lapack/base/zsyconvf_rook
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zsyconvf_rook from '@rreusser/blahpack/lapack/base/zsyconvf_rook';
*
* var A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 3.0, 0.5, 2.0, 0.0 ] );
* var E = new Complex128Array( 2 );
* var IPIV = new Int32Array( [ -1, -1 ] );
*
* zsyconvf_rook.ndarray( 'upper', 'convert', 2, A, 1, 2, 0, E, 1, 0, IPIV, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zsyconvf_rook.ndarray" }
