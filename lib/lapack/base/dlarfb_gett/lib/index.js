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
* ## Notes
*
* -   `dlarfb_gett` applies a block Householder reflector `H` from the left to a `(K+M)`-by-`N` "triangular-pentagonal" matrix composed of an upper trapezoidal `K`-by-`N` block `A` and a rectangular `M`-by-`N` block `B`.
* -   The elementary reflectors are held in the strictly lower triangle of the leading `K`-by-`K` block of `A` (`V1`, with implicit unit diagonal) and in the leading `M`-by-`K` block of `B` (`V2`). The upper triangular `K`-by-`K` matrix `T` defines the block reflector.
* -   When `ident` is `'identity'`, `V1` is taken to be the identity and is not read from `A`.
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

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlarfb_gett.ndarray" }
