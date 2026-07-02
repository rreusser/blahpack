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
* Compute a partial factorization of a complex Hermitian indefinite matrix using the bounded Bunch-Kaufman ("rook") diagonal pivoting method.
*
* @module @stdlib/lapack/base/zlahef-rook
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zlahefRook = require( '@stdlib/lapack/base/zlahef-rook' );
*
* var A = new Complex128Array( [ 4.0, 0.0, 1.0, 0.5, 0.0, 0.0, 3.0, 0.0 ] );
* var IPIV = new Int32Array( 2 );
* var W = new Complex128Array( 4 );
*
* zlahefRook( 'column-major', 'lower', 2, 2, A, 2, IPIV, W, 2 );
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zlahefRook = require( '@stdlib/lapack/base/zlahef-rook' );
*
* var A = new Complex128Array( [ 4.0, 0.0, 1.0, 0.5, 0.0, 0.0, 3.0, 0.0 ] );
* var IPIV = new Int32Array( 2 );
* var W = new Complex128Array( 4 );
*
* zlahefRook.ndarray( 'lower', 2, 2, A, 1, 2, 0, IPIV, 1, 0, W, 1, 2, 0 );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlahefRook.ndarray" }
