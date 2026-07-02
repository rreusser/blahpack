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
* Solve a triangular system of equations with multiple right-hand sides and scale factors set to prevent overflow.
*
* @module @stdlib/lapack/base/dlatrs3
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlatrs3 = require( '@stdlib/lapack/base/dlatrs3' );
*
* var A = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 1.0, 2.0, 4.0 ] );
* var X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
* var scale = new Float64Array( 2 );
* var cnorm = new Float64Array( 3 );
* var work = new Float64Array( 2 + 1 + 40 );
*
* dlatrs3( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, A, 3, X, 3, scale, 1, cnorm, 1, work, 1 );
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlatrs3 = require( '@stdlib/lapack/base/dlatrs3' );
*
* var A = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 1.0, 2.0, 4.0 ] );
* var X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
* var scale = new Float64Array( 2 );
* var cnorm = new Float64Array( 3 );
* var work = new Float64Array( 2 + 1 + 40 );
*
* dlatrs3.ndarray( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, work, 1, 0 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlatrs3.ndarray" }
