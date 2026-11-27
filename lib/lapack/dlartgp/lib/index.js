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
* Generate a plane rotation with non-negative diagonal.
*
* ## Notes
*
* -   This is a more accurate (and slower) alternative to the Level-1 BLAS routine `drotg`. Unlike `dlartg`, `dlartgp` always returns a non-negative `r`.
* -   If `g = 0`, then `cs = sign(1, f)` and `sn = 0`.
* -   If `f = 0` and `g != 0`, then `cs = 0` and `sn = sign(1, g)`.
* -   The algorithm incorporates iterative rescaling to avoid overflow or underflow for inputs with extreme magnitude.
*
* @module @rreusser/blahpack/lapack/dlartgp
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlartgp from '@rreusser/blahpack/lapack/dlartgp';
*
* var cs = new Float64Array( 1 );
* var sn = new Float64Array( 1 );
* var r = new Float64Array( 1 );
*
* dlartgp( 1.0, 1.0, cs, sn, r );
* // r[ 0 ] => ~1.414213562
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlartgp from '@rreusser/blahpack/lapack/dlartgp';
*
* var cs = new Float64Array( 1 );
* var sn = new Float64Array( 1 );
* var r = new Float64Array( 1 );
*
* // A negative `f` flips the sign of `cs` so that `r` is non-negative:
* dlartgp.ndarray( -3.0, 4.0, cs, sn, r );
* // cs[ 0 ] => -0.6
* // sn[ 0 ] => 0.8
* // r[ 0 ] => 5.0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlartgp from './dlartgp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlartgp, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlartgp & { ndarray: typeof ndarray }} */ ( dlartgp );
export { ndarray };
