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
* Solves a real quasi-triangular system of equations.
*
* @module @stdlib/lapack/base/dlaqtr
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlaqtr = require( '@rreusser/blahpack/lapack/base/dlaqtr' );
*
* var T = new Float64Array([ 2.0, 0.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.0, 3.0, -1.0, 4.0, 0.0, 0.0, 0.0, 0.0, 0.0 ]);
* var b = new Float64Array( 4 );
* var x = new Float64Array([ 10.0, 5.0, 8.0, 0.0, 0.0, 0.0, 0.0, 0.0 ]);
* var WORK = new Float64Array( 8 );
*
* var out = dlaqtr( 'column-major', false, true, 3, T, 4, b, 1, 0.0, x, 1, WORK, 1 );
* // out.info === 0; x[ 0 ], x[ 1 ], x[ 2 ] hold the solution
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlaqtr.ndarray" }
