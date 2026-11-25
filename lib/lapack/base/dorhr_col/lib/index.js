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
* Reconstructs the Householder vectors and block reflectors of a compact-WY TSQR factorization.
*
* @module @rreusser/blahpack/lapack/base/dorhr_col
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dorhr_col from '@rreusser/blahpack/lapack/base/dorhr_col';
*
* var A = new Float64Array([ 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5 ]);
* var T = new Float64Array( 4 );
* var d = new Float64Array( 2 );
*
* dorhr_col( 'column-major', 4, 2, 2, A, 4, T, 2, d, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dorhr_col.ndarray" }
