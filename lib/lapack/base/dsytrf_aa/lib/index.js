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
* Computes the factorization of a real symmetric matrix using Aasen's algorithm (blocked).
*
* @module @stdlib/lapack/base/dsytrf_aa
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dsytrfAa = require( './../lib' );
*
* var A = new Float64Array([ 4, 2, 1, 0, 0, 5, 2, 1, 0, 0, 6, 3, 0, 0, 0, 8 ]);
* var IPIV = new Int32Array( 4 );
*
* var info = dsytrfAa( 'column-major', 'lower', 4, A, 4, IPIV );
* // info => 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;
