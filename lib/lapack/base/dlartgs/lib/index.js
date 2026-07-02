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
* Generate a plane rotation for the bidiagonal SVD implicit QR iteration.
*
* @module @stdlib/lapack/base/dlartgs
*
* @example
* var dlartgs = require( '@stdlib/lapack/base/dlartgs' );
*
* dlartgs( 3.0, 4.0, 1.5 );
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlartgs = require( '@stdlib/lapack/base/dlartgs' );
*
* var out = new Float64Array( 2 );
* dlartgs.ndarray( 3.0, 4.0, 1.5, out );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlartgs.ndarray" }
