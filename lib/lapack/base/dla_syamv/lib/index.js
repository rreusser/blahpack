/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable camelcase */

/**
* Computes a matrix-vector product `y := alpha*|A|*|x| + beta*|y|` using a symmetric indefinite matrix to calculate error bounds.
*
* ## Notes
*
* -   Computes `y := alpha*|A|*|x| + beta*|y|` using the symmetric matrix `A`; both triangles of `A` contribute via symmetry regardless of which triangle is referenced.
* -   To protect against underflow, non-symbolically-zero components are perturbed by `(N+1)` times the underflow threshold. An entry is considered "symbolically zero" only when every multiplication contributing to it has a zero operand.
* -   This routine is primarily used in LAPACK error-bound computations (e.g., `dsyrfsx`).
*
* @module @rreusser/blahpack/lapack/base/dla_syamv
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dla_syamv from '@rreusser/blahpack/lapack/base/dla_syamv';
*
* var A = new Float64Array( [ 1.0, -2.0, -2.0, 5.0 ] );
* var x = new Float64Array( [ 1.0, 1.0 ] );
* var y = new Float64Array( [ 0.0, 0.0 ] );
*
* dla_syamv( 'row-major', 'upper', 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_syamv from './dla_syamv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dla_syamv, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dla_syamv & { ndarray: typeof ndarray }} */ ( dla_syamv );
export { ndarray };
