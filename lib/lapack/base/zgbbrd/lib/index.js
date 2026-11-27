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
* Reduces a complex general band matrix to real upper bidiagonal form.
*
* @module @rreusser/blahpack/lapack/base/zgbbrd
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgbbrd from '@rreusser/blahpack/lapack/base/zgbbrd';
*
* // 3x3 tridiagonal matrix (kl = ku = 1) in band storage:
* var AB = new Complex128Array( [ 0,0, 2,0, -1,0,  -1,0, 3,0, -1,0,  -1,0, 4,0, 0,0 ] );
* var d = new Float64Array( 3 );
* var e = new Float64Array( 2 );
* var Q = new Complex128Array( 1 );
* var PT = new Complex128Array( 1 );
* var C = new Complex128Array( 1 );
* var WORK = new Complex128Array( 3 );
* var RWORK = new Float64Array( 3 );
*
* var info = zgbbrd( 'column-major', 'no-vectors', 3, 3, 0, 1, 1, AB, 3, d, 1, e, 1, Q, 1, PT, 1, C, 1, WORK, RWORK );
* // returns 0
*
* // The bidiagonal B has the same singular values as A (|det| = 18):
* // d => <Float64Array>[ ~2.2361, ~2.9535, ~2.7255 ]
* // e => <Float64Array>[ ~2.2804, ~2.5784 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgbbrd from './zgbbrd.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgbbrd, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zgbbrd & { ndarray: typeof ndarray }} */ ( zgbbrd );
export { ndarray };
