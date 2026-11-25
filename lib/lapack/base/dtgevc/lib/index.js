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
* Computes some or all of the right and/or left eigenvectors of a pair of real matrices.
*
* @module @rreusser/blahpack/lapack/base/dtgevc
*
* @example
* import dtgevc from '@rreusser/blahpack/lapack/base/dtgevc';
*
* // Upper triangular pencil (S, P) with P = I: eigenvalues 1 and 2.
* var S = new Float64Array( [ 1.0, 0.0, 1.0, 2.0 ] );
* var P = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var VL = new Float64Array( 4 );
* var VR = new Float64Array( 4 );
* var SELECT = new Uint8Array( 2 );
* var M = new Int32Array( 1 );
* var WORK = new Float64Array( 12 );
*
* var info = dtgevc( 'column-major', 'both', 'all', SELECT, 1, 2, S, 2, P, 2, VL, 2, VR, 2, 2, M, WORK );
* // returns 0
*
* // M[ 0 ] => 2
* // VR => <Float64Array>[ 1.0, 0.0, 1.0, 1.0 ]
* // VL => <Float64Array>[ 1.0, -1.0, 0.0, 1.0 ]
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dtgevc.ndarray" }
