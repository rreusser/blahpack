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
* ZLAHEF_RK computes a partial factorization of a complex Hermitian indefinite matrix using bounded Bunch-Kaufman (rook) diagonal pivoting method, producing _rk format output.
*
* ## Notes
*
* -   See LAPACK reference documentation for full algorithmic details.
*
* @module @rreusser/blahpack/lapack/zlahef_rk
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlahefRk from '@rreusser/blahpack/lapack/zlahef_rk';
*
* // 3x3 Hermitian matrix (lower triangle referenced):
* var A = new Complex128Array([ 4.0, 0.0, 1.0, -0.5, 2.0, 0.3, 1.0, 0.5, 3.0, 0.0, 0.5, -0.2, 2.0, -0.3, 0.5, 0.2, 5.0, 0.0 ]);
* var e = new Complex128Array( 3 );
* var IPIV = new Int32Array( 3 );
* var W = new Complex128Array( 9 );
* var kb = new Int32Array( 1 );
*
* var info = zlahefRk( 'column-major', 'lower', 3, 3, kb, A, 3, e, 1, IPIV, 1, W, 3 );
* // returns 0
*
* // kb[ 0 ] => 3
* // IPIV => <Int32Array>[ 0, 1, 2 ]
* // A => <Complex128Array>[ 4, 0, 0.25, -0.125, 0.5, 0.075, 1, 0.5, 2.6875, 0, ~0.0139535, ~-0.195349, 2, -0.3, 0.5, 0.2, ~3.874419, 0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlahefRk from './zlahef_rk.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zlahefRk, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zlahefRk & { strided: typeof strided }} */ ( zlahefRk );
export { strided };
