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
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlahefRook from '@rreusser/blahpack/lapack/base/zlahef_rook';
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
* import zlahefRook from '@rreusser/blahpack/lapack/base/zlahef_rook';
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
