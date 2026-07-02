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
* Simultaneously bidiagonalizes the blocks of a tall and skinny complex matrix `[X11; X21]` with orthonormal columns (variant 3 — `M-P` is the minimum dimension).
*
* @module @stdlib/lapack/base/zunbdb3
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var zunbdb3 = require( '@stdlib/lapack/base/zunbdb3' );
*
* var X11 = new Complex128Array( 16 );
* var X21 = new Complex128Array( 16 );
* var THETA = new Float64Array( 4 );
* var PHI = new Float64Array( 3 );
* var TAUP1 = new Complex128Array( 5 );
* var TAUP2 = new Complex128Array( 3 );
* var TAUQ1 = new Complex128Array( 4 );
* var WORK = new Complex128Array( 8 );
*
* zunbdb3( 'column-major', 8, 5, 4, X11, 8, X21, 8, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zunbdb3.ndarray" }
