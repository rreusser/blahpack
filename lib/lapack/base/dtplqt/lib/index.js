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
* Compute a blocked LQ factorization of a real triangular-pentagonal matrix using the compact WY representation for `Q`.
*
* ## Notes
*
* -   `A` is an `M`-by-`M` lower triangular matrix; on exit it contains the lower triangular factor `L` of the LQ factorization of `[A, B]`.
* -   `B` is an `M`-by-`N` pentagonal matrix whose first `N - l` columns are rectangular and whose last `l` columns form a lower trapezoidal block; on exit it contains the Householder reflector representation `V`.
* -   `T` stores the `mb`-by-`mb` upper triangular block reflector factors `T1, T2, ..., TB` for each panel, packed side-by-side as an `mb`-by-`M` matrix `T = [T1 T2 ... TB]`.
* -   `mb` partitions the rows of `A` into panels of size `mb` (the last panel may be smaller). Each panel is factored by the unblocked kernel `dtplqt2`, then the resulting block reflector is applied to the trailing rows via `dtprfb`.
* -   `WORK` must be sized for at least `mb*M` doubles.
*
* @module @rreusser/blahpack/lapack/base/dtplqt
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dtplqt from '@rreusser/blahpack/lapack/base/dtplqt';
*
* var A = new Float64Array( [ 2.0, 0.5, 0.0, 3.0 ] );
* var B = new Float64Array( [ 1.0, 0.3, 0.5, 1.1 ] );
* var T = new Float64Array( 4 );
* var WORK = new Float64Array( 4 );
*
* dtplqt( 'column-major', 2, 2, 0, 2, A, 2, B, 2, T, 2, WORK );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dtplqt.ndarray" }
