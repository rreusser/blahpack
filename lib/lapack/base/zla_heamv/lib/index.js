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
* Computes a matrix-vector product using a Hermitian indefinite matrix to calculate error bounds.
*
* ## Notes
*
* -   A and x are complex arrays (`Complex128Array`), while y is a real array (`Float64Array`).
* -   `CABS1(z) = |Re(z)| + |Im(z)|` is used to compute absolute values for error bounding.
* -   To protect against underflow, non-symbolically-zero components are perturbed by `(N+1)*safmin`.
*
* @module @rreusser/blahpack/lapack/base/zla_heamv
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import zla_heamv from '@rreusser/blahpack/lapack/base/zla_heamv';
*
* var A = new Complex128Array( [ 2.0, 0.0, 1.0, 2.0, 1.0, -2.0, 5.0, 0.0 ] );
* var x = new Complex128Array( [ 1.0, 0.5, -2.0, 1.0 ] );
* var y = new Float64Array( 2 );
*
* zla_heamv( 'column-major', 'upper', 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zla_heamv.ndarray" }
