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
* Compute a blocked QR factorization of a real triangular-pentagonal matrix using the compact WY representation for `Q`.
*
* ## Notes
*
* -   `A` is an `N`-by-`N` upper triangular matrix; on exit it contains the upper triangular factor `R` of the QR factorization of `[ A; B ]`.
* -   `B` is an `M`-by-`N` pentagonal matrix whose first `M - l` rows are rectangular and whose last `l` rows form an upper trapezoidal block; on exit it contains the Householder reflector representation `V`.
* -   `T` stores the `ib`-by-`ib` upper triangular block reflector factors `T1, T2, ..., TB` for each panel, packed side-by-side as an `nb`-by-`N` matrix `T = [T1 T2 ... TB]`.
* -   `nb` partitions the columns of `A` into panels of width `nb` (the last panel may be smaller). Each panel is factored by the unblocked kernel `dtpqrt2`, then the resulting block reflector is applied to the trailing columns via `dtprfb`.
* -   `WORK` must be sized for at least `nb*N` doubles.
*
* @module @rreusser/blahpack/lapack/base/dtpqrt
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dtpqrt from '@rreusser/blahpack/lapack/base/dtpqrt';
*
* var A = new Float64Array( [ 2.0, 0.0, 0.5, 3.0 ] );
* var B = new Float64Array( [ 1.0, 0.3, 0.5, 1.1 ] );
* var T = new Float64Array( 4 );
* var WORK = new Float64Array( 4 );
*
* dtpqrt( 'column-major', 2, 2, 0, 2, A, 2, B, 2, T, 2, WORK );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtpqrt from './dtpqrt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtpqrt, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dtpqrt & { ndarray: typeof ndarray }} */ ( dtpqrt );
export { ndarray };
