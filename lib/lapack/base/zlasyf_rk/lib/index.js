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
* ## Notes
*
* -   See LAPACK reference documentation for full algorithmic details.
*
* @module @rreusser/blahpack/lapack/base/zlasyf_rk
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlasyfRk from '@rreusser/blahpack/lapack/base/zlasyf_rk';
*
* // 3x3 complex symmetric matrix (lower triangle referenced):
* var A = new Complex128Array([ 4.0, 1.0, 1.0, -0.5, 2.0, 0.3, 1.0, -0.5, 3.0, 2.0, 0.5, -0.2, 2.0, 0.3, 0.5, -0.2, 5.0, 1.0 ]);
* var e = new Complex128Array( 3 );
* var IPIV = new Int32Array( 3 );
* var W = new Complex128Array( 9 );
* var kb = new Int32Array( 1 );
*
* var info = zlasyfRk( 'column-major', 'lower', 3, 3, kb, A, 3, e, 1, IPIV, 1, W, 3 );
* // returns 0
*
* // kb[ 0 ] => 3
* // IPIV => <Int32Array>[ 0, 1, 2 ]
* // A => <Complex128Array>[ 4, 1, ~0.2058824, ~-0.1764706, ~0.4882353, ~-0.0470588, 1, -0.5, ~2.8823529, ~2.2794118, ~0.0229240, ~0.0135039, 2, 0.3, 0.5, -0.2, ~4.0098339, ~0.9450803 ]
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlasyf_rk.ndarray" }
