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
* Uses inverse iteration to find an eigenvector of a complex upper Hessenberg matrix.
*
* ## Notes
*
* -   On entry, if `noinit` is `true`, the initial eigenvector is generated internally; otherwise `v` is used as the initial vector.
* -   On exit, `v` contains the normalized eigenvector.
* -   Returns `0` on success, `1` if inverse iteration failed to converge.
*
* @module @rreusser/blahpack/lapack/zlaein
*
* @example
* import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlaein from '@rreusser/blahpack/lapack/zlaein';
*
* // Upper Hessenberg (here triangular) H with eigenvalues 1 and 2 (column-major):
* var H = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.5, 0.0, 2.0, 0.0 ] );
* var v = new Complex128Array( 2 );
* var B = new Complex128Array( 4 );
* var RWORK = new Float64Array( 2 );
*
* // Inverse iteration for the right eigenvector of the eigenvalue 2:
* var w = new Complex128( 2.0, 0.0 );
*
* var info = zlaein( 'column-major', true, true, 2, H, 2, w, v, 1, B, 2, RWORK, 1.0e-14, 1.0e-292 );
* // returns 0
*
* // The eigenvector [ 0.5, 1 ], scaled so its largest component has unit magnitude:
* // v => <Complex128Array>[ ~0.5, 0.0, 1.0, 0.0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaein from './zlaein.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zlaein, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zlaein & { strided: typeof strided }} */ ( zlaein );
export { strided };
