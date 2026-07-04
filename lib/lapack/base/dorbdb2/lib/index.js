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
* Simultaneously bidiagonalize the blocks of a tall and skinny matrix `[X11; X21]` with orthonormal columns (variant 2 of the dorbdb1-6 family).
*
* @module @stdlib/lapack/base/dorbdb2
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dorbdb2 = require( '@stdlib/lapack/base/dorbdb2' );
*
* var X11 = new Float64Array( 16 );
* var X21 = new Float64Array( 16 );
* var THETA = new Float64Array( 2 );
* var PHI = new Float64Array( 1 );
* var TAUP1 = new Float64Array( 1 );
* var TAUP2 = new Float64Array( 6 );
* var TAUQ1 = new Float64Array( 2 );
* var WORK = new Float64Array( 16 );
*
* dorbdb2( 'column-major', 8, 2, 2, X11, 2, X21, 6, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dorbdb2.ndarray" }
