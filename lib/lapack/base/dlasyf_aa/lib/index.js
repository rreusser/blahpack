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
* Factorize a panel of a real symmetric matrix using Aasen's algorithm.
*
* @module @stdlib/lapack/base/dlasyf_aa
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dlasyfAa = require( '@stdlib/lapack/base/dlasyf_aa' );
*
* var A = new Float64Array( [ 4.0, 1.0, 2.0, 1.0, 5.0, 1.5, 2.0, 1.5, 6.0 ] );
* var H = new Float64Array( 9 );
* var WORK = new Float64Array( 3 );
* var IPIV = new Int32Array( 3 );
*
* dlasyfAa( 'column-major', 'lower', 1, 3, 3, A, 3, IPIV, 1, 0, H, 3, WORK, 1 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlasyf_aa.ndarray" }
