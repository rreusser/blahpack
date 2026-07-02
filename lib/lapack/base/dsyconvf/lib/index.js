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
* LAPACK routine to convert the factorization output format used in `dsytrf` to the format used in `dsytrf_rk` and vice versa.
*
* @module @stdlib/lapack/base/dsyconvf
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dsyconvf = require( '@stdlib/lapack/base/dsyconvf' );
*
* var A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 5.0, 0.0, 3.0, 6.0, 9.0 ] );
* var E = new Float64Array( 3 );
* var IPIV = new Int32Array( [ 0, 1, 2 ] );
*
* dsyconvf( 'column-major', 'upper', 'convert', 3, A, 3, E, 1, IPIV, 1, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dsyconvf.ndarray" }
