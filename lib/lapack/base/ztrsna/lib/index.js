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
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex triangular matrix.
*
* ## Notes
*
* -   `ztrsna` computes only the condition numbers; it does not compute eigenvalues or eigenvectors themselves. Inputs `VL` and `VR` are typically obtained from `ztrevc`.
*
* @module @rreusser/blahpack/lapack/base/ztrsna
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztrsna from '@rreusser/blahpack/lapack/base/ztrsna';
*
* var T = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.3, 0.1, 2.0, 0.0 ] );
* var VL = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var VR = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var SELECT = new Uint8Array( 2 );
* var S = new Float64Array( 2 );
* var SEP = new Float64Array( 2 );
* var M = new Int32Array( 1 );
* var WORK = new Complex128Array( 2 * 3 );
* var RWORK = new Float64Array( 2 );
*
* ztrsna( 'column-major', 'both', 'all', SELECT, 1, 2, T, 2, VL, 2, VR, 2, S, 1, SEP, 1, 2, M, WORK, 2, RWORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "ztrsna.ndarray" }
