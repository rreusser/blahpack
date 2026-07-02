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
* Computes the modified LU factorization without pivoting of a complex general M-by-N matrix (recursive kernel).
*
* @module @stdlib/lapack/base/zlaunhr_col_getrfnp2
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlaunhr_col_getrfnp2 = require( '@stdlib/lapack/base/zlaunhr_col_getrfnp2' );
*
* var A = new Complex128Array( [ 0.5, 0.3, 0.2, -0.1, -0.3, 0.2, -0.1, 0.4, 0.6, -0.2, 0.1, 0.3, 0.2, -0.3, -0.4, 0.1, 0.5, 0.2 ] );
* var D = new Complex128Array( 3 );
*
* zlaunhr_col_getrfnp2( 'column-major', 3, 3, A, 3, D, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlaunhr_col_getrfnp2.ndarray" }
