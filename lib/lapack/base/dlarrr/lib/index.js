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
* Tests whether a symmetric tridiagonal matrix warrants expensive computations for high relative accuracy.
*
* @module @stdlib/lapack/base/dlarrr
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlarrr = require( '@stdlib/lapack/base/dlarrr' );
*
* var d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
* var e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
*
* var info = dlarrr( 5, d, 1, e, 1 );
* // returns 0
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlarrr.ndarray" }
