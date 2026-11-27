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
* Computes the factorization of a complex symmetric matrix using Aasen's algorithm (blocked).
*
* @module @rreusser/blahpack/lapack/base/zsytrf_aa
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zsytrfAa from '@rreusser/blahpack/lapack/base/zsytrf_aa';
*
* var A = new Complex128Array( 16 );
* A.set( [ 4, 0 ], 0 );
* A.set( [ 2, 0 ], 1 );
* A.set( [ 1, 0 ], 2 );
* A.set( [ 5, 0 ], 5 );
* A.set( [ 2, 0 ], 6 );
* A.set( [ 6, 0 ], 10 );
* A.set( [ 8, 0 ], 15 );
* var IPIV = new Int32Array( 4 );
*
* var info = zsytrfAa( 'column-major', 'lower', 4, A, 4, IPIV );
* // info => 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsytrfAa from './zsytrf_aa.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsytrfAa, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zsytrfAa & { ndarray: typeof ndarray }} */ ( zsytrfAa );
export { ndarray };
