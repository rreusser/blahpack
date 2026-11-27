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
* Applies a real Householder block reflector to a triangular-pentagonal matrix.
*
* @module @rreusser/blahpack/lapack/base/dlarfb_gett
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlarfb_gett from '@rreusser/blahpack/lapack/base/dlarfb_gett';
*
* // A single reflector H = I - tau*v*v^T with v = [ 1, 0.5 ] and tau = 1.6, which maps [ 3, 4 ] to [ -5, 0 ].
* // C = [ A; B ] is 2x2: A = [ 1, 3 ] (top row) and B = [ 0.5, 4 ] (bottom row; B[ 0 ] holds v[ 1 ]):
* var A = new Float64Array( [ 1.0, 3.0 ] );
* var B = new Float64Array( [ 0.5, 4.0 ] );
* var T = new Float64Array( [ 1.6 ] );
* var WORK = new Float64Array( 2 );
*
* dlarfb_gett( 'column-major', 'identity', 1, 2, 1, T, 1, A, 1, B, 1, WORK, 1 );
*
* // H*C:
* // A => <Float64Array>[ ~-0.6, -5.0 ]
* // B => <Float64Array>[ -0.8, 0.0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarfb_gett from './dlarfb_gett.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarfb_gett, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlarfb_gett & { ndarray: typeof ndarray }} */ ( dlarfb_gett );
export { ndarray };
