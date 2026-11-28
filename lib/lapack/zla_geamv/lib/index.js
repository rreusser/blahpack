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
* Computes `y := alpha*|A|*|x| + beta*|y|` using a general complex matrix to calculate error bounds.
*
* ## Notes
*
* -   To protect against underflow, components in the resulting vector are perturbed away from zero by `(N+1)` times the underflow threshold. "Symbolically" zero components (where every contributing product has a zero operand) are not perturbed.
* -   Absolute values use the CABS1 norm: `|re(z)| + |im(z)|` (not the true modulus).
* -   This routine is primarily used in calculating error bounds for iterative refinement.
*
* @module @rreusser/blahpack/lapack/zla_geamv
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import zlaGeamv from '@rreusser/blahpack/lapack/zla_geamv';
*
* var A = new Complex128Array( [ 1.0, 0.0, -2.0, 0.0, 3.0, 0.0, -4.0, 0.0 ] );
* var x = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );
* var y = new Float64Array( [ 0.0, 0.0 ] );
*
* zlaGeamv( 'row-major', 'no-transpose', 2, 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_geamv from './zla_geamv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_geamv, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zla_geamv & { ndarray: typeof ndarray }} */ ( zla_geamv );
export { ndarray };
