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
* Swaps adjacent diagonal 1-by-1 blocks in an upper triangular matrix pair.
*
* ## Notes
*
* -   `ztgex2` is the complex version of `dtgex2`. Since complex triangular matrices have only 1-by-1 blocks (no 2-by-2 blocks as in the real case), this routine is simpler.
* -   The routine computes unitary matrices Q and Z such that `Q' * A * Z` and `Q' * B * Z` have their diagonal blocks swapped.
* -   Returns 0 on success, 1 if the swap was rejected (the blocks are too close to being degenerate).
*
* @module @rreusser/blahpack/lapack/base/ztgex2
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztgex2 from '@rreusser/blahpack/lapack/base/ztgex2';
*
* var A = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 0.3, 0.1, 2.0, -0.3 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, -0.1, 0.5, 0.2 ] );
* var Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
*
* var info = ztgex2( 'column-major', true, true, 2, A, 2, B, 2, Q, 2, Z, 2, 0 );
* // info => 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztgex2 from './ztgex2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztgex2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof ztgex2 & { ndarray: typeof ndarray }} */ ( ztgex2 );
export { ndarray };
