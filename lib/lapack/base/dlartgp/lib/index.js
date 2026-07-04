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
* Generate a plane rotation with non-negative diagonal.
*
* @module @stdlib/lapack/base/dlartgp
*
* @example
* var dlartgp = require( '@stdlib/lapack/base/dlartgp' );
*
* dlartgp( 1.0, 1.0 );
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlartgp = require( '@stdlib/lapack/base/dlartgp' );
*
* var out = new Float64Array( 3 );
* dlartgp.ndarray( 1.0, 1.0, out );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlartgp.ndarray" }
