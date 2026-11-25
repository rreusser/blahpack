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
* Uses inverse iteration to find right and/or left eigenvectors of a real upper Hessenberg matrix.
*
* @module @rreusser/blahpack/lapack/base/dhsein
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dhsein from '@rreusser/blahpack/lapack/base/dhsein';
*
* var N = 3;
*
* // Upper triangular (column-major) H = [ [ 1, 2, 3 ], [ 0, 4, 5 ], [ 0, 0, 6 ] ]:
* var H = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0 ] );
* var WR = new Float64Array( [ 1.0, 4.0, 6.0 ] );
* var WI = new Float64Array( N );
* var SELECT = new Uint8Array( [ 1, 1, 1 ] );
* var VL = new Float64Array( N * N );
* var VR = new Float64Array( N * N );
* var M = new Int32Array( 1 );
* var WORK = new Float64Array( ( N + 2 ) * N );
* var IFAILL = new Int32Array( N );
* var IFAILR = new Int32Array( N );
*
* var info = dhsein( 'column-major', 'right', 'no-source', 'no-init', SELECT, 1, N, H, N, WR, 1, WI, 1, VL, N, VR, N, N, M, WORK, IFAILL, 1, IFAILR, 1 );
* // returns 0
*
* // M[ 0 ] => 3
*
* // Right eigenvector for λ = 6, scaled so its largest entry is 1:
* // [ VR[ 6 ], VR[ 7 ], VR[ 8 ] ] => [ ~0.64, 1.0, ~0.4 ]
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dhsein.ndarray" }
