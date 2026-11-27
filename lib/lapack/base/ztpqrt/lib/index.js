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
* Compute a blocked QR factorization of a complex triangular-pentagonal matrix using the compact WY representation for `Q`.
*
* ## Notes
*
* -   `A` is an `N`-by-`N` upper triangular matrix; on exit it contains the upper triangular factor `R` of the QR factorization of `[ A; B ]`.
* -   `B` is an `M`-by-`N` pentagonal matrix whose first `M - l` rows are rectangular and whose last `l` rows form an upper trapezoidal block; on exit it contains the Householder reflector representation `V`.
* -   `T` stores the `ib`-by-`ib` upper triangular block reflector factors `T1, T2, ..., TB` for each panel, packed side-by-side as an `nb`-by-`N` matrix `T = [T1 T2 ... TB]`.
* -   `nb` partitions the columns of `A` into panels of width `nb` (the last panel may be smaller). Each panel is factored by the unblocked kernel `ztpqrt2`, then the resulting block reflector is applied to the trailing columns via `ztprfb`.
* -   `WORK` must be sized for at least `nb*N` complex elements.
*
* @module @rreusser/blahpack/lapack/base/ztpqrt
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztpqrt from '@rreusser/blahpack/lapack/base/ztpqrt';
*
* var A = new Complex128Array( [ 2.0, 0.0, 0.0, 0.0, 0.5, 0.0, 3.0, 0.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.3, 0.0, 0.5, 0.0, 1.1, 0.0 ] );
* var T = new Complex128Array( 4 );
* var WORK = new Complex128Array( 4 );
*
* ztpqrt( 'column-major', 2, 2, 0, 2, A, 2, B, 2, T, 2, WORK );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztpqrt.ndarray" }
