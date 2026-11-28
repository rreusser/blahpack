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
* ## Notes
*
* -   `zlahef_rook` is an auxiliary routine called by `zhetrf_rook`. It uses blocked code (calling Level-3 BLAS) to factor at most `nb` columns and update the trailing/leading submatrix.
* -   The factorization has the form `A = U*D*U**H` (upper) or `A = L*D*L**H` (lower), where `D` is a block diagonal with `1x1` and `2x2` blocks chosen by the bounded Bunch-Kaufman ("rook") pivoting strategy.
* -   Pivot indices in `IPIV` follow the stdlib bitwise-NOT convention: a `1x1` pivot stores a non-negative `0`-based row index; a `2x2` pivot stores `~p` (bitwise NOT of the `0`-based row index) for both rows of the block.
* -   For Hermitian matrices, the diagonal entries are real; the imaginary parts are explicitly zeroed by the routine.
*
* @module @stdlib/lapack/base/zlahef-rook
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlahefRook from '@rreusser/blahpack/lapack/zlahef_rook';
*
* // 3x3 Hermitian matrix (lower triangle referenced):
* var A = new Complex128Array([ 4.0, 0.0, 1.0, -0.5, 2.0, 0.3, 1.0, 0.5, 3.0, 0.0, 0.5, -0.2, 2.0, -0.3, 0.5, 0.2, 5.0, 0.0 ]);
* var IPIV = new Int32Array( 3 );
* var W = new Complex128Array( 9 );
* var kb = new Int32Array( 1 );
*
* var info = zlahefRook( 'column-major', 'lower', 3, 3, kb, A, 3, IPIV, 1, W, 3 );
* // returns 0
*
* // kb[ 0 ] => 3
* // IPIV => <Int32Array>[ 0, 1, 2 ]
* // A => <Complex128Array>[ 4, 0, 0.25, -0.125, 0.5, 0.075, 1, 0.5, 2.6875, 0, ~0.0139535, ~-0.195349, 2, -0.3, 0.5, 0.2, ~3.874419, 0 ]
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlahefRook from '@rreusser/blahpack/lapack/zlahef_rook';
*
* // 2x2 Hermitian matrix A = [ 4, 1-0.5i; 1+0.5i, 3 ] (lower triangle referenced):
* var A = new Complex128Array( [ 4.0, 0.0, 1.0, 0.5, 0.0, 0.0, 3.0, 0.0 ] );
* var IPIV = new Int32Array( 2 );
* var W = new Complex128Array( 4 );
* var kb = new Int32Array( 1 );
*
* var info = zlahefRook.ndarray( 'lower', 2, 2, kb, A, 1, 2, 0, IPIV, 1, 0, W, 1, 2, 0 );
* // returns 0
*
* // kb[ 0 ] => 2
* // A => <Complex128Array>[ 4, 0, 0.25, 0.125, 0, 0, 2.6875, 0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlahefRook from './zlahef_rook.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlahefRook, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlahefRook & { ndarray: typeof ndarray }} */ ( zlahefRook );
export { ndarray };
