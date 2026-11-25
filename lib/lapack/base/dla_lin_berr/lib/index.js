/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable camelcase */

/**
* Compute a component-wise relative backward error.
*
* @module @rreusser/blahpack/lapack/base/dla_lin_berr
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dla_lin_berr from '@rreusser/blahpack/lapack/base/dla_lin_berr';
*
* var res = new Float64Array( [ 1e-6, 2e-6, 3e-6, 4e-6 ] );
* var ayb = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var berr = new Float64Array( 2 );
*
* dla_lin_berr( 'column-major', 2, 2, 2, res, 2, ayb, 2, berr, 1 );
* // berr => <Float64Array>[ ~1e-6, ~1e-6 ]
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dla_lin_berr from '@rreusser/blahpack/lapack/base/dla_lin_berr';
*
* var res = new Float64Array( [ 1e-6, 2e-6, 3e-6, 4e-6 ] );
* var ayb = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var berr = new Float64Array( 2 );
*
* dla_lin_berr.ndarray( 2, 2, 2, res, 1, 2, 0, ayb, 1, 2, 0, berr, 1, 0 );
* // berr => <Float64Array>[ 1e-6, 1e-6 ]
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;
