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
* Compute a blocked LQ factorization of a complex triangular-pentagonal matrix using the compact WY representation for `Q`.
*
* @module @rreusser/blahpack/lapack/base/ztplqt
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztplqt from '@rreusser/blahpack/lapack/base/ztplqt';
*
* var A = new Complex128Array( [ 2.0, 0.0, 0.5, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.3, 0.0, 0.5, 0.0, 1.1, 0.0 ] );
* var T = new Complex128Array( 4 );
* var WORK = new Complex128Array( 4 );
*
* ztplqt( 'column-major', 2, 2, 0, 2, A, 2, B, 2, T, 2, WORK );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztplqt.ndarray" }
