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
* Applies a complex block reflector from RZ factorization to a general matrix.
*
* ## Notes
*
* -   Currently only `direct = 'backward'` and `storev = 'rowwise'` are supported (matching the Fortran reference).
* -   `V` is a K-by-L matrix of row-stored reflector vectors.
* -   `T` is the K-by-K lower triangular block-reflector factor from `zlarzt`.
* -   `WORK` must be at least `N*K` elements for `side = 'left'` and `M*K` elements for `side = 'right'`.
*
* @module @rreusser/blahpack/lapack/zlarzb
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlarzb from '@rreusser/blahpack/lapack/zlarzb';
*
* // One reflector H = I - tau*v*v^H with v = [ 1, 0, 0.5 ] (K = 1, l = 1) and tau = 0.8:
* var V = new Complex128Array( [ 0.5, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
* var T = new Complex128Array( [ 0.8, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
*
* // C = [ 1, 2; 3, 4; 5, 6 ]:
* var C = new Complex128Array( [ 1, 0, 3, 0, 5, 0, 2, 0, 4, 0, 6, 0 ] );
* var WORK = new Complex128Array( 3 );
*
* zlarzb( 'column-major', 'left', 'no-transpose', 'backward', 'rowwise', 3, 2, 1, 1, V, 3, T, 3, C, 3, WORK, 3 );
* // C => <Complex128Array>[ ~-1.8, 0, 3, 0, ~3.6, 0, -2, 0, 4, 0, 4, 0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarzb from './zlarzb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarzb, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlarzb & { ndarray: typeof ndarray }} */ ( zlarzb );
export { ndarray };
