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
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex generalized Schur form.
*
* @module @rreusser/blahpack/lapack/base/ztgsna
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztgsna from '@rreusser/blahpack/lapack/base/ztgsna';
*
* // Diagonal pencil A = diag(2+i, 4), B = I with identity eigenvectors:
* var A = new Complex128Array( [ 2.0, 1.0, 0.0, 0.0, 0.0, 0.0, 4.0, 0.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var VL = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var VR = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var SELECT = new Uint8Array( 2 );
* var s = new Float64Array( 2 );
* var DIF = new Float64Array( 2 );
* var M = new Int32Array( 1 );
* var WORK = new Complex128Array( 16 );
* var IWORK = new Int32Array( 8 );
*
* var info = ztgsna( 'column-major', 'eigenvalues', 'all', SELECT, 1, 2, A, 2, B, 2, VL, 2, VR, 2, s, 1, DIF, 1, 2, M, WORK, IWORK );
* // returns 0
*
* // M[ 0 ] => 2
*
* // s(i) = sqrt( |a(i)|^2 + |b(i)|^2 ), i.e. [ sqrt(6), sqrt(17) ]:
* // s => <Float64Array>[ ~2.4494897428, ~4.1231056256 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztgsna from './ztgsna.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztgsna, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof ztgsna & { ndarray: typeof ndarray }} */ ( ztgsna );
export { ndarray };
