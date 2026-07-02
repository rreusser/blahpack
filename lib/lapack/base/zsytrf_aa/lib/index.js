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
* Computes the factorization of a complex symmetric matrix using Aasen's algorithm (blocked).
*
* @module @stdlib/lapack/base/zsytrf_aa
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zsytrfAa = require( './../lib' );
*
* var A = new Complex128Array( 16 );
* A.set( [ 4, 0 ], 0 );
* A.set( [ 2, 0 ], 1 );
* A.set( [ 1, 0 ], 2 );
* A.set( [ 5, 0 ], 5 );
* A.set( [ 2, 0 ], 6 );
* A.set( [ 6, 0 ], 10 );
* A.set( [ 8, 0 ], 15 );
* var IPIV = new Int32Array( 4 );
*
* var info = zsytrfAa( 'column-major', 'lower', 4, A, 4, IPIV );
* // info => 0
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;
