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
* DLASYF_RK computes a partial factorization of a real symmetric indefinite matrix using bounded Bunch-Kaufman (rook) diagonal pivoting method, producing _rk format output.
*
* @module @stdlib/lapack/base/dlasyfRk
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var dlasyfRk = require( '@rreusser/blahpack/lapack/base/dlasyf_rk' );
*
* var A = new Float64Array([ 4.0, 1.0, 2.0, 0.5, 0.0, 3.0, 0.5, 1.0, 0.0, 0.0, 5.0, 0.2, 0.0, 0.0, 0.0, 6.0 ]);
* var e = new Float64Array( 4 );
* var IPIV = new Int32Array( 4 );
* var W = new Float64Array( 16 );
*
* dlasyfRk( 'column-major', 'lower', 4, 4, A, 4, e, IPIV, W, 4 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlasyfRk.ndarray" }
