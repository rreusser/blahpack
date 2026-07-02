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
* Multiply a complex M-by-N matrix by a real N-by-N matrix.
*
* @module @stdlib/lapack/base/zlacrm
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlacrm = require( '@stdlib/lapack/base/zlacrm' );
*
* var A = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var C = new Complex128Array( 2 );
* var RWORK = new Float64Array( 4 );
*
* zlacrm( 'column-major', 1, 2, A, 1, B, 2, C, 1, RWORK );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlacrm.ndarray" }
