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
* Estimates the infinity norm condition number for a general complex matrix with x scaling.
*
* ## Notes
*
* -   The input matrix `AF` must be the LU factorization produced by `zgetrf`.
* -   `WORK` must have length at least `2*N` complex elements; `RWORK` must have length at least `N` doubles.
* -   `X` is a complex scaling vector: this routine estimates the condition number of `op(A) * diag(X)`.
*
* @module @rreusser/blahpack/lapack/base/zla_gercond_x
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zla_gercond_x from '@rreusser/blahpack/lapack/base/zla_gercond_x';
*
* var A = new Complex128Array( [ 2, 0, 1, 0, 1, 0, 3, 0 ] );
* var AF = new Complex128Array( A );
* var IPIV = new Int32Array( [ 0, 1 ] );
* var X = new Complex128Array( [ 1, 0, 1, 0 ] );
* var WORK = new Complex128Array( 4 );
* var RWORK = new Float64Array( 2 );
*
* var rcond = zla_gercond_x( 'column-major', 'no-transpose', 2, A, 2, AF, 2, IPIV, 1, 0, X, 1, WORK, 1, RWORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_gercond_x.ndarray" }
