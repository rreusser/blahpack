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
* Computes some or all of the right and/or left eigenvectors of a complex upper triangular matrix.
*
* @module @rreusser/blahpack/lapack/base/ztrevc
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import ztrevc from '@rreusser/blahpack/lapack/base/ztrevc';
*
* // Upper triangular T with eigenvalues 1+i and 2 (column-major):
* var T = new Complex128Array( [ 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 2.0, 0.0 ] );
* var VL = new Complex128Array( 4 );
* var VR = new Complex128Array( 4 );
* var SELECT = new Uint8Array( 2 );
* var M = new Int32Array( 1 );
* var WORK = new Complex128Array( 4 );
* var RWORK = new Float64Array( 2 );
*
* var info = ztrevc( 'column-major', 'both', 'all', SELECT, 1, 2, T, 2, VL, 2, VR, 2, 2, M, WORK, RWORK );
* // returns 0
*
* // M[ 0 ] => 2
*
* // Right eigenvectors: T*x = lambda*x, with x = [ 1, 0 ] and [ (1+i)/2, 1 ]:
* // VR => <Complex128Array>[ 1.0, 0.0, 0.0, 0.0, 0.5, 0.5, 1.0, 0.0 ]
*
* // Left eigenvectors: y^H*T = lambda*y^H, with y = [ 1, (-1+i)/2 ] and [ 0, 1 ]:
* // VL => <Complex128Array>[ 1.0, 0.0, -0.5, 0.5, 0.0, 0.0, 1.0, 0.0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztrevc from './ztrevc.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztrevc, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof ztrevc & { ndarray: typeof ndarray }} */ ( ztrevc );
export { ndarray };
