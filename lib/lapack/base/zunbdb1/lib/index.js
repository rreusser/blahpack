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
* Simultaneously bidiagonalize the blocks of a tall and skinny complex matrix with orthonormal columns.
*
* @module @rreusser/blahpack/lapack/base/zunbdb1
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zunbdb1 from '@rreusser/blahpack/lapack/base/zunbdb1';
*
* var X11 = new Complex128Array( 16 );
* var X21 = new Complex128Array( 16 );
* var THETA = new Float64Array( 2 );
* var PHI = new Float64Array( 1 );
* var TAUP1 = new Complex128Array( 4 );
* var TAUP2 = new Complex128Array( 4 );
* var TAUQ1 = new Complex128Array( 2 );
* var WORK = new Complex128Array( 6 );
*
* zunbdb1( 'column-major', 8, 4, 2, X11, 4, X21, 4, THETA, 1, PHI, 1, TAUP1, 1, TAUP2, 1, TAUQ1, 1, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zunbdb1.ndarray" }
