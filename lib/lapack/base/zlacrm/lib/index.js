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
* Multiply a complex M-by-N matrix by a real N-by-N matrix.
*
* ## Notes
*
* -   `zlacrm` exploits the fact that `B` is purely real by extracting the real and imaginary parts of `A` separately and applying `dgemm` twice. The `RWORK` array provides scratch space for this decomposition and must hold at least `2*M*N` real values.
*
* @module @rreusser/blahpack/lapack/base/zlacrm
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlacrm from '@rreusser/blahpack/lapack/base/zlacrm';
*
* var A = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var C = new Complex128Array( 2 );
* var RWORK = new Float64Array( 4 );
*
* zlacrm( 'column-major', 1, 2, A, 1, B, 2, C, 1, RWORK );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlacrm from './zlacrm.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlacrm, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlacrm & { ndarray: typeof ndarray }} */ ( zlacrm );
export { ndarray };
