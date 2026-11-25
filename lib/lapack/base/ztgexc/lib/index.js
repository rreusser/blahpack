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
* Reorders the generalized Schur decomposition of a complex matrix pair.
*
* @module @rreusser/blahpack/lapack/base/ztgexc
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztgexc from '@rreusser/blahpack/lapack/base/ztgexc';
*
* // Upper triangular pencil (A, I) with eigenvalues 1+i and 2 (column-major):
* var A = new Complex128Array( [ 1.0, 1.0, 0.0, 0.0, 0.5, 0.0, 2.0, 0.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var Q = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var Z = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
*
* // Move the diagonal element at row 0 to row 1 (0-based):
* var ilst = new Int32Array( [ 1 ] );
*
* var info = ztgexc( 'column-major', true, true, 2, A, 2, B, 2, Q, 2, Z, 2, 0, ilst );
* // returns 0
*
* // The eigenvalues on the diagonal of A are swapped:
* // A => <Complex128Array>[ 2.0, 0.0, 0.0, 0.0, 0.5, 0.0, ~1.0, 1.0 ]
* // B => <Complex128Array>[ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ]
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztgexc.ndarray" }
