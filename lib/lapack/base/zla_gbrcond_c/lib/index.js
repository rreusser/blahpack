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
* Estimates the infinity norm condition number for a complex general banded matrix with inverse-c scaling.
*
* @module @rreusser/blahpack/lapack/base/zla_gbrcond_c
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zla_gbrcond_c from '@rreusser/blahpack/lapack/base/zla_gbrcond_c';
*
* var AB = new Complex128Array( [ 0, 0, 5, 0, 0, 0 ] );
* var AFB = new Complex128Array( [ 0, 0, 0, 0, 5, 0 ] );
* var IPIV = new Int32Array( [ 1 ] );
* var c = new Float64Array( [ 2.0 ] );
* var WORK = new Complex128Array( 2 );
* var RWORK = new Float64Array( 1 );
*
* var rcond = zla_gbrcond_c.ndarray( 'no-transpose', 1, 0, 0, AB, 1, 1, 1, AFB, 1, 1, 2, IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_gbrcond_c from './zla_gbrcond_c.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_gbrcond_c, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zla_gbrcond_c & { ndarray: typeof ndarray }} */ ( zla_gbrcond_c );
export { ndarray };
