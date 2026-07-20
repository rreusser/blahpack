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
* ZLASYF_RK computes a partial factorization of a complex symmetric indefinite matrix using bounded Bunch-Kaufman (rook) diagonal pivoting method, producing _rk format output.
*
* @module @stdlib/lapack/base/zlasyf_rk
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
* var zlasyfRk = require( '@rreusser/blahpack/lapack/base/zlasyf_rk' );
*
* var A = new Complex128Array([ 4.0, 0.0, 1.0, -0.5, 2.0, 0.3, 1.0, 0.5, 3.0, 0.0, 0.5, -0.2, 2.0, -0.3, 0.5, 0.2, 5.0, 0.0 ]);
* var e = new Complex128Array( 3 );
* var IPIV = new Int32Array( 3 );
* var W = new Complex128Array( 9 );
*
* zlasyfRk( 'column-major', 'lower', 3, 3, A, 3, e, IPIV, W, 3 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlasyf_rk.ndarray" }
