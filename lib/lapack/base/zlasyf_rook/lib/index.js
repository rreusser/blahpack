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
* ## Notes
*
* -   Pivot indices follow the stdlib bitwise-NOT convention: 1x1 pivots use non-negative indices; 2x2 pivots use `~p` (bitwise NOT) for both rows of the block.
* -   The matrix is treated as complex symmetric (NOT Hermitian); there is no conjugation at mirror reads and the diagonal may be fully complex.
* -   See LAPACK reference documentation for full algorithmic details.
*
* @module @rreusser/blahpack/lapack/base/zlasyf_rook
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlasyfRook from '@rreusser/blahpack/lapack/base/zlasyf_rook';
*
* // 3x3 complex symmetric matrix (lower triangle referenced):
* var A = new Complex128Array([ 4.0, 1.0, 1.0, -0.5, 2.0, 0.3, 1.0, -0.5, 3.0, 2.0, 0.5, -0.2, 2.0, 0.3, 0.5, -0.2, 5.0, 1.0 ]);
* var IPIV = new Int32Array( 3 );
* var W = new Complex128Array( 9 );
* var kb = new Int32Array( 1 );
*
* var info = zlasyfRook( 'column-major', 'lower', 3, 3, kb, A, 3, IPIV, 1, W, 3 );
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

// exports: { "ndarray": "zlasyf_rook.ndarray" }
