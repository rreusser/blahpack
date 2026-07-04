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
* Generates an `M`-by-`N` complex matrix `Q` with orthonormal columns from the output of `zlatsqr`, using a row-block (GETT) sweep.
*
* @module @stdlib/lapack/base/zungtsqr_row
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlatsqr = require( '@stdlib/lapack/base/zlatsqr' );
* var zungtsqr_row = require( '@stdlib/lapack/base/zungtsqr_row' );
*
* var A = new Complex128Array( 6 );
* var T = new Complex128Array( 4 );
* var WORK = new Complex128Array( 2 );
* zlatsqr( 'column-major', 3, 2, 4, 2, A, 3, T, 2, WORK );
* zungtsqr_row( 'column-major', 3, 2, 4, 2, A, 3, T, 2, WORK );
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zungtsqr_row.ndarray" }
