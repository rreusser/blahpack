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
* ## Notes
*
* -   `SELECT` is a Uint8Array (or Array) of length `N` where `SELECT[i] !== 0` selects the eigenvector corresponding to `wr[i] + i*wi[i]`. For complex conjugate pairs, if either member is selected both are computed and `SELECT` is updated so only the first is marked.
* -   The function returns an object `{ info, m }`, where `m` is the number of eigenvectors actually computed (columns of `VL`/`VR`).
* -   `WORK` must be at least `(N+2)*N` doubles.
*
* @module @rreusser/blahpack/lapack/dhsein
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dhsein from '@rreusser/blahpack/lapack/dhsein';
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

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dhsein from './dhsein.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dhsein, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dhsein & { ndarray: typeof ndarray }} */ ( dhsein );
export { ndarray };
