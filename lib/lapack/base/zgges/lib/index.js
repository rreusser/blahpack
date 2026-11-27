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
* Computes generalized eigenvalues and Schur form for a pair of complex nonsymmetric matrices.
*
* ## Notes
*
* -   See LAPACK reference documentation for full algorithmic details.
*
* @module @rreusser/blahpack/lapack/base/zgges
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgges from '@rreusser/blahpack/lapack/base/zgges';
*
* function noop() { return false; }
*
* // Upper triangular pencil (A, I) with eigenvalues 1+i and 3 (column-major):
* var A = new Complex128Array( [ 1.0, 1.0, 0.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
* var B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
* var sdim = new Int32Array( 1 );
* var ALPHA = new Complex128Array( 2 );
* var BETA = new Complex128Array( 2 );
* var VSL = new Complex128Array( 4 );
* var VSR = new Complex128Array( 4 );
* var WORK = new Complex128Array( 18 );
* var RWORK = new Float64Array( 20 );
* var BWORK = new Uint8Array( 2 );
*
* var info = zgges( 'column-major', 'compute-vectors', 'compute-vectors', 'none', noop, 2, A, 2, B, 2, sdim, ALPHA, 1, BETA, 1, VSL, 2, VSR, 2, WORK, RWORK, BWORK );
* // returns 0
*
* // ALPHA => <Complex128Array>[ 1.0, 1.0, 3.0, 0.0 ]
* // BETA => <Complex128Array>[ 1.0, 0.0, 1.0, 0.0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgges from './zgges.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgges, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zgges & { ndarray: typeof ndarray }} */ ( zgges );
export { ndarray };
