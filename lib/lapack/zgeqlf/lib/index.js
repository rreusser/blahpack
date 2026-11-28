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
* Computes a QL factorization of a complex general matrix.
*
* ## Notes
*
* -   `zgeqlf` computes a QL factorization of a complex M-by-N matrix `A = Q * L` using a blocked Householder algorithm. The lower trapezoidal matrix `L` is written into the lower-left corner of `A`, and the Householder vectors encoding `Q` are stored in the remaining entries.
* -   The workspace size is automatically managed; `lwork` is accepted for API compatibility but ignored.
*
* @module @rreusser/blahpack/lapack/zgeqlf
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgeqlf from '@rreusser/blahpack/lapack/zgeqlf';
*
* var A = new Complex128Array( [ 1.0, 0.5, 2.0, 1.0, 3.0, 1.5, 4.0, 2.0, 0.5, 1.0, 1.0, 0.5, 1.5, 1.0, 2.0, 1.5, 1.0, 0.0, 2.0, 0.5, 3.0, 1.0, 4.0, 1.5 ] );
* var TAU = new Complex128Array( 3 );
* var WORK = new Complex128Array( 256 );
*
* zgeqlf( 'column-major', 4, 3, A, 4, TAU, 1, WORK, 1, -1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeqlf from './zgeqlf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgeqlf, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zgeqlf & { ndarray: typeof ndarray }} */ ( zgeqlf );
export { ndarray };
