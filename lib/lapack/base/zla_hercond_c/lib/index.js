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
* Estimates the infinity norm condition number for a Hermitian indefinite matrix with inverse-c scaling.
*
* @module @rreusser/blahpack/lapack/base/zla_hercond_c
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zhetrf from '@rreusser/blahpack/lapack/base/zhetrf';
* import zla_hercond_c from '@rreusser/blahpack/lapack/base/zla_hercond_c';
*
* var N = 1;
* var A = new Complex128Array( [ 5.0, 0.0 ] );
* var AF = new Complex128Array( [ 5.0, 0.0 ] );
* var IPIV = new Int32Array( [ 1 ] );
* var c = new Float64Array( [ 2.0 ] );
* var WORK = new Complex128Array( 2 );
* var RWORK = new Float64Array( 1 );
*
* zhetrf( 'column-major', 'upper', N, AF, N, IPIV );
*
* var rcond = zla_hercond_c( 'column-major', 'upper', N, A, N, AF, N, IPIV, 1, 0, c, 1, true, WORK, 1, RWORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_hercond_c from './zla_hercond_c.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_hercond_c, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zla_hercond_c & { ndarray: typeof ndarray }} */ ( zla_hercond_c );
export { ndarray };
