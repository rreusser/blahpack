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
* Compute a safe BLAS-style constant for scaling matrix norms
*
* @module @stdlib/lapack/base/dlarmm
*
*
* @example
* var dlarmm = require( '@stdlib/lapack/base/dlarmm' );
*
* dlarmm( 1.0, 1.0, 1.0 );
* dlarmm( 1e308, 1.0, 1e307 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlarmm.ndarray" }
