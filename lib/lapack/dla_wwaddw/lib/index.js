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
* Add a vector to a doubled-single precision accumulator (X, Y).
*
* ## Notes
*
* -   The `(s + s) - s` rounding step in the inner loop is **not** a no-op in IEEE 754 floating-point arithmetic. It extracts the rounded high-order part of `x[i] + w[i]`, with the truncated low-order bits pushed into the compensation term `y[i]`.
* -   This routine is a leaf LAPACK helper used by iterative refinement extended routines (`dgerfsx`, `dsyrfsx`, `dporfsx`, etc.) for extra-precise accumulation.
* -   Quick return when `N == 0`: all arrays are left untouched.
*
* @module @stdlib/lapack/base/dla-wwaddw
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dla_wwaddw from '@rreusser/blahpack/lapack/dla_wwaddw';
*
* var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var y = new Float64Array( [ 0.1, 0.2, 0.3 ] );
* var w = new Float64Array( [ 10.0, 20.0, 30.0 ] );
*
* dla_wwaddw( 3, x, 1, y, 1, w, 1 );
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dla_wwaddw from '@rreusser/blahpack/lapack/dla_wwaddw';
*
* var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var y = new Float64Array( [ 0.1, 0.2, 0.3 ] );
* var w = new Float64Array( [ 10.0, 20.0, 30.0 ] );
*
* dla_wwaddw.strided( 3, x, 1, 0, y, 1, 0, w, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_wwaddw from './dla_wwaddw.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dla_wwaddw, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dla_wwaddw & { strided: typeof strided }} */ ( dla_wwaddw );
export { strided };
