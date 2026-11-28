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
* Computes the generalized singular value decomposition of a complex matrix pair.
*
* @module @rreusser/blahpack/lapack/zggsvd3
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zggsvd3 from '@rreusser/blahpack/lapack/zggsvd3';
*
* var A = new Complex128Array( 9 );
* var B = new Complex128Array( 6 );
* // Populate A and B, then invoke zggsvd3 with the required workspaces...
* var K = new Int32Array( 1 );
* // info = zggsvd3( 'compute-U', 'compute-V', 'compute-Q', 3, 3, 2, K, L, A, 3, B, 2, ... );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zggsvd3 from './zggsvd3.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zggsvd3, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zggsvd3 & { strided: typeof strided }} */ ( zggsvd3 );
export { strided };
