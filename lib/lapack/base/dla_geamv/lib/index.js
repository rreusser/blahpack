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
* Computes a matrix-vector product `y := alpha*|A|*|x| + beta*|y|` using a general matrix to calculate error bounds.
*
* ## Notes
*
* -   Performs `y := alpha*|A|*|x| + beta*|y|` (or the transposed variant). Because all contributions are nonnegative, `y` is effectively rewritten in place with `|y|` when `beta != 0`.
* -   To protect against underflow, non-symbolic-zero components are perturbed by `(N+1)` times the underflow threshold. An entry is considered "symbolically zero" only when every multiplication contributing to it has a zero operand.
* -   This routine is primarily used in LAPACK error-bound computations (e.g., `dgerfsx`).
*
* @module @rreusser/blahpack/lapack/base/dla_geamv
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dla_geamv from '@rreusser/blahpack/lapack/base/dla_geamv';
*
* var A = new Float64Array( [ 1.0, -2.0, 3.0, -4.0 ] );
* var x = new Float64Array( [ 1.0, 1.0 ] );
* var y = new Float64Array( [ 0.0, 0.0 ] );
*
* dla_geamv( 'row-major', 'no-transpose', 2, 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_geamv from './dla_geamv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dla_geamv, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dla_geamv & { ndarray: typeof ndarray }} */ ( dla_geamv );
export { ndarray };
