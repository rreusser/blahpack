/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable camelcase */

/**
* Estimates the Skeel condition number for a symmetric indefinite matrix.
*
* @module @rreusser/blahpack/lapack/base/dla_syrcond
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dla_syrcond from '@rreusser/blahpack/lapack/base/dla_syrcond';
*
* var A = new Float64Array( [ 2.0, -1.0, -1.0, 3.0 ] );
* var AF = new Float64Array( [ 2.0, -1.0, -1.0, 3.0 ] );
* var IPIV = new Int32Array( [ 0, 1 ] );
* var c = new Float64Array( [ 1.0, 1.0 ] );
* var WORK = new Float64Array( 6 );
* var IWORK = new Int32Array( 2 );
*
* var rcond = dla_syrcond( 'column-major', 'upper', 2, A, 2, AF, 2, IPIV, 1, c, WORK, IWORK );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_syrcond from './dla_syrcond.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dla_syrcond, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dla_syrcond & { ndarray: typeof ndarray }} */ ( dla_syrcond );
export { ndarray };
