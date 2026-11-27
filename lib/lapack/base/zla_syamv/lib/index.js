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
* Computes `y := alpha*|A|*|x| + beta*|y|` using a complex symmetric matrix to calculate error bounds.
*
* ## Notes
*
* -   `A` and `x` are complex (`Complex128Array`), but `y`, `alpha`, and `beta` are real. The routine uses CABS1 (1-norm: `|Re(z)| + |Im(z)|`) for absolute values of complex entries.
* -   Components in `y` are perturbed away from zero by `(N+1)` times the underflow threshold to protect against underflow, except for "symbolically" zero entries.
*
* @module @rreusser/blahpack/lapack/base/zla_syamv
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import zla_syamv from '@rreusser/blahpack/lapack/base/zla_syamv';
*
* var A = new Complex128Array( [ 1.0, 2.0, -2.0, 1.0, -2.0, 1.0, 5.0, 0.0 ] );
* var x = new Complex128Array( [ 1.0, -1.0, -2.0, 0.5 ] );
* var y = new Float64Array( [ 0.0, 0.0 ] );
*
* zla_syamv( 'row-major', 'upper', 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_syamv.ndarray" }
