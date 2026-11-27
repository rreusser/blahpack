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
* Computes eigenvalues of a symmetric tridiagonal matrix to suitable accuracy.
*
* ## Notes
*
* -   See LAPACK reference documentation for full algorithmic details.
*
* @module @rreusser/blahpack/lapack/base/dlarrd
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dlarrd from '@rreusser/blahpack/lapack/base/dlarrd';
*
* var N = 4;
* var d = new Float64Array( [ 2.0, -1.0, 3.0, 0.5 ] );
* var e = new Float64Array( [ 1.0, 1.0, 1.0, 0.0 ] );
* var E2 = new Float64Array( [ 1.0, 1.0, 1.0, 0.0 ] );
* var GERS = new Float64Array( [ 1.0, 3.0, -3.0, 1.0, 1.0, 5.0, -0.5, 1.5 ] );
* var ISPLIT = new Int32Array( [ N ] );
* var m = new Int32Array( 1 );
* var w = new Float64Array( N );
* var WERR = new Float64Array( N );
* var wl = new Float64Array( 1 );
* var wu = new Float64Array( 1 );
* var IBLOCK = new Int32Array( N );
* var INDEXW = new Int32Array( N );
* var WORK = new Float64Array( 4 * N );
* var IWORK = new Int32Array( 3 * N );
*
* var info = dlarrd( 'all', 'entire', N, 0.0, 0.0, 0, 0, GERS, 1, 8.881784197001252e-16, d, 1, e, 1, E2, 1, 2.2250738585072014e-308, 1, ISPLIT, 1, m, w, 1, WERR, 1, wl, wu, IBLOCK, 1, INDEXW, 1, WORK, IWORK );
* // returns 0
* // m[ 0 ] => 4
* // w => <Float64Array>[ ~-1.53084, ~0.20287, ~2.24962, ~3.57835 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarrd from './dlarrd.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarrd, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlarrd & { ndarray: typeof ndarray }} */ ( dlarrd );
export { ndarray };
