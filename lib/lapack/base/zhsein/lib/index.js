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
* Uses inverse iteration to find right and/or left eigenvectors of a complex upper Hessenberg matrix.
*
* ## Notes
*
* -   `w` supplies the eigenvalues (e.g. from `zhseqr`) whose eigenvectors are wanted.
*     `SELECT[j]` chooses which eigenvectors to compute; `M` returns how many.
* -   `H` must be upper Hessenberg. Eigenvectors are found by inverse iteration and
*     `IFAILL`/`IFAILR` flag any that failed to converge.
*
* @module @rreusser/blahpack/lapack/base/zhsein
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zhsein from '@rreusser/blahpack/lapack/base/zhsein';
*
* // Upper Hessenberg (here triangular) H with eigenvalues 1 and 2 (column-major):
* var H = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.5, 0.0, 2.0, 0.0 ] );
* var w = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
* var SELECT = new Uint8Array( [ 1, 1 ] );
* var VL = new Complex128Array( 4 );
* var VR = new Complex128Array( 4 );
* var WORK = new Complex128Array( 4 );
* var RWORK = new Float64Array( 2 );
* var IFAILL = new Int32Array( 2 );
* var IFAILR = new Int32Array( 2 );
* var M = new Int32Array( 1 );
*
* var info = zhsein( 'column-major', 'both', 'no-source', 'no-init', SELECT, 1, 2, H, 2, w, 1, VL, 2, VR, 2, 2, M, WORK, RWORK, IFAILL, 1, IFAILR, 1 );
* // returns 0
*
* // M[ 0 ] => 2
*
* // Right eigenvectors [ 1, 0 ] and [ 0.5, 1 ]:
* // VR => <Complex128Array>[ 1.0, 0.0, 0.0, 0.0, 0.5, 0.0, 1.0, 0.0 ]
*
* // Left eigenvectors [ 1, -0.5 ] and [ 0, 1 ]:
* // VL => <Complex128Array>[ 1.0, 0.0, -0.5, 0.0, 0.0, 0.0, 1.0, 0.0 ]
*
* // IFAILR => <Int32Array>[ 0, 0 ]
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zhsein.ndarray" }
