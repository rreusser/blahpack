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
* Estimates reciprocal condition numbers of eigenvalues and/or eigenvectors of a real upper quasi-triangular matrix
*
* @module @stdlib/lapack/base/dtrsna
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var Uint8Array = require( '@stdlib/array/uint8' );
* var dtrsna = require( '@rreusser/blahpack/lapack/base/dtrsna' );
*
* var T = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 3.0 ]);
* var VL = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
* var VR = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
* var SELECT = new Uint8Array( 3 );
* var s = new Float64Array( 3 );
* var SEP = new Float64Array( 3 );
* var WORK = new Float64Array( 3 * 9 );
* var IWORK = new Int32Array( 6 );
*
* var out = dtrsna( 'column-major', 'eigenvalues', 'all', SELECT, 1, 3, T, 3, VL, 3, VR, 3, s, 1, SEP, 1, 3, WORK, 3, IWORK, 1, 0 );
* // out => { 'info': 0, 'm': 3 }; s holds the reciprocal eigenvalue condition numbers
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dtrsna.ndarray" }
