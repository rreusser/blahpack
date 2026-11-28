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
* Compute a blocked LQ factorization of a complex triangular-pentagonal matrix using the compact WY representation for `Q`.
*
* ## Notes
*
* -   `A` is an `M`-by-`M` lower triangular complex matrix; on exit it contains the lower triangular factor `L` of the LQ factorization of `[A, B]`.
* -   `B` is an `M`-by-`N` pentagonal complex matrix whose first `N - l` columns are rectangular and whose last `l` columns form a lower trapezoidal block; on exit it contains the Householder reflector representation `V`.
* -   `T` stores the `mb`-by-`mb` upper triangular block reflector factors `T1, T2, ..., TB` for each panel, packed side-by-side as an `mb`-by-`M` matrix `T = [T1 T2 ... TB]`.
* -   `mb` partitions the rows of `A` into panels of size `mb` (the last panel may be smaller). Each panel is factored by the unblocked kernel `ztplqt2`, then the resulting block reflector is applied to the trailing rows via `ztprfb`.
* -   `WORK` must be sized for at least `mb*M` complex elements.
*
* @module @rreusser/blahpack/lapack/ztplqt
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztplqt from '@rreusser/blahpack/lapack/ztplqt';
*
* var A = new Complex128Array( [ 2.0, 0.0, 0.5, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.3, 0.0, 0.5, 0.0, 1.1, 0.0 ] );
* var T = new Complex128Array( 4 );
* var WORK = new Complex128Array( 4 );
*
* ztplqt( 'column-major', 2, 2, 0, 2, A, 2, B, 2, T, 2, WORK );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztplqt from './ztplqt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztplqt, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof ztplqt & { ndarray: typeof ndarray }} */ ( ztplqt );
export { ndarray };
