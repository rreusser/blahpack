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
* Computes a partial factorization of a complex symmetric matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method.
*
* @module @stdlib/lapack/base/zlasyf_rook
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zlasyfRook = require( '@stdlib/lapack/base/zlasyf-rook' );
*
* var N = 3;
* var nb = 3;
* var A = new Complex128Array( N * N );
* var IPIV = new Int32Array( N );
* var W = new Complex128Array( N * nb );
*
* var result = zlasyfRook( 'column-major', 'lower', N, nb, A, N, IPIV, W, N );
* // returns { info: 0, kb: 3 }
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlasyf_rook.ndarray" }
