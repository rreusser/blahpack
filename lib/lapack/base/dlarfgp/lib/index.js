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
* Generates a real elementary reflector with non-negative beta.
*
* @module @stdlib/lapack/base/dlarfgp
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlarfgp = require( '@stdlib/lapack/base/dlarfgp' );
*
* var alpha = new Float64Array( [ 3.0 ] );
* var x = new Float64Array( [ 4.0, 0.0, 0.0 ] );
* var tau = new Float64Array( 1 );
*
* dlarfgp( 4, alpha, 0, x, 1, tau, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlarfgp.ndarray" }
