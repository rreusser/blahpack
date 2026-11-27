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
* Forms the triangular factor T of a complex block reflector.
*
* ## Notes
*
* -   Only `direct = 'backward'` and `storev = 'rowwise'` are currently supported, matching the reference LAPACK implementation.
* -   All array strides and offsets are in complex elements (not Float64 units).
*
* @module @rreusser/blahpack/lapack/base/zlarzt
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlarzt from '@rreusser/blahpack/lapack/base/zlarzt';
*
* var K = 1;
* var N = 3;
* var V = new Complex128Array( [ 0.3, 0.1, -0.5, 0.2, 0.0, 0.0 ] );
* var TAU = new Complex128Array( [ 0.8, -0.3 ] );
* var T = new Complex128Array( K * K );
*
* zlarzt.ndarray( 'backward', 'rowwise', N, K, V, 1, K, 0, TAU, 1, 0, T, 1, K, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarzt from './zlarzt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarzt, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlarzt & { ndarray: typeof ndarray }} */ ( zlarzt );
export { ndarray };
