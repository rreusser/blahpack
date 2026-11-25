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
* Reconstructs Householder reflector vectors and block reflector triangular factors from a unitary-on-input matrix.
*
* @module @rreusser/blahpack/lapack/base/zunhr_col
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zunhr_col from '@rreusser/blahpack/lapack/base/zunhr_col';
*
* // 3x2 matrix with orthonormal columns [ 0.6, 0.8, 0 ] and [ 0, 0, 1 ]:
* var A = new Complex128Array( [ 0.6, 0.0, 0.8, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var T = new Complex128Array( 2 * 2 );
* var d = new Complex128Array( 2 );
*
* var info = zunhr_col( 'column-major', 3, 2, 2, A, 3, T, 2, d, 1 );
* // returns 0
*
* // d => <Complex128Array>[ -1, 0, -1, 0 ]
* // A => <Complex128Array>[ ~1.6, 0, 0.5, 0, 0, 0, 0, 0, 1, 0, 1, 0 ]
* // T => <Complex128Array>[ ~1.6, 0, 0, 0, -0.8, 0, 1, 0 ]
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zunhr_col.ndarray" }
