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
* Uses inverse iteration to find right and/or left eigenvectors of a complex upper Hessenberg matrix
*
* @module @stdlib/lapack/base/zhsein
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var Uint8Array = require( '@stdlib/array/uint8' );
* var zhsein = require( '@rreusser/blahpack/lapack/base/zhsein' );
*
* var H = new Complex128Array([ 1.0, 0.0, 0.0, 0.0, 0.5, 0.0, 2.0, 0.0 ]);
* var w = new Complex128Array([ 1.0, 0.0, 2.0, 0.0 ]);
* var SELECT = new Uint8Array([ 1, 1 ]);
* var VL = new Complex128Array( 4 );
* var VR = new Complex128Array( 4 );
* var WORK = new Complex128Array( 4 );
* var RWORK = new Float64Array( 2 );
* var IFAILL = new Int32Array( 2 );
* var IFAILR = new Int32Array( 2 );
* var M = new Int32Array([ 0 ]);
*
* var out = zhsein( 'column-major', 'right', 'no', 'no', SELECT, 1, 2, H, 2, w, 1, VL, 2, VR, 2, 2, M, WORK, 1, RWORK, 1, IFAILL, 1, 0, IFAILR, 1, 0 );
* // out => { 'info': 0, 'm': 2, ... }; VR holds the right eigenvectors
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zhsein.ndarray" }
