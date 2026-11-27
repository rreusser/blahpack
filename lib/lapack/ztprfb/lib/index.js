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
* Apply a complex triangular-pentagonal block reflector to a matrix.
*
* ## Notes
*
* -   `ztprfb` applies a complex triangular-pentagonal block reflector `H` (or `H^H`) to an `M`-by-`N` matrix `C` partitioned as `[A; B]` (for `side = 'left'`) or `[A, B]` (for `side = 'right'`), where `A` holds the "triangular" block and `B` holds the "pentagonal" tail. Used as a building block by block-QR/LQ routines.
*
* @module @rreusser/blahpack/lapack/base/ztprfb
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztprfb from '@rreusser/blahpack/lapack/base/ztprfb';
*
* var V = new Complex128Array( 16 );
* var T = new Complex128Array( 9 );
* var A = new Complex128Array( 12 );
* var B = new Complex128Array( 20 );
* var W = new Complex128Array( 12 );
*
* ztprfb.ndarray( 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 1, 5, 0, T, 1, 3, 0, A, 1, 3, 0, B, 1, 5, 0, W, 1, 3, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztprfb from './ztprfb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztprfb, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof ztprfb & { ndarray: typeof ndarray }} */ ( ztprfb );
export { ndarray };
