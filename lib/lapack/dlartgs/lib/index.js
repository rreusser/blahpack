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
* Generate a plane rotation for the bidiagonal SVD implicit QR iteration.
*
* ## Notes
*
* -   If `x^2 - sigma^2` and `x*y` are both zero, the rotation is by PI/2.
* -   The routine is used as a shift-generation primitive inside Golub-Reinsch-style implicit QR iteration for the bidiagonal SVD.
*
* @module @rreusser/blahpack/lapack/dlartgs
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlartgs from '@rreusser/blahpack/lapack/dlartgs';
*
* var cs = new Float64Array( 1 );
* var sn = new Float64Array( 1 );
*
* dlartgs( 3.0, 4.0, 1.5, cs, sn );
* // cs[ 0 ] => ~0.49026
* // sn[ 0 ] => ~0.87158
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlartgs from '@rreusser/blahpack/lapack/dlartgs';
*
* var cs = new Float64Array( 1 );
* var sn = new Float64Array( 1 );
*
* dlartgs.ndarray( 3.0, 4.0, 1.5, cs, sn );
* // cs[ 0 ] => ~0.49026
* // sn[ 0 ] => ~0.87158
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlartgs from './dlartgs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlartgs, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlartgs & { ndarray: typeof ndarray }} */ ( dlartgs );
export { ndarray };
