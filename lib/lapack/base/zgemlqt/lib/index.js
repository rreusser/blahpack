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
* Overwrites a complex M-by-N matrix C with `op(Q)*C` or `C*op(Q)` using the compact-WY representation produced by `zgelqt`.
*
* @module @rreusser/blahpack/lapack/base/zgemlqt
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgemlqt from '@rreusser/blahpack/lapack/base/zgemlqt';
*
* var V = new Complex128Array( 12 );
* var T = new Complex128Array( 6 );
* var C = new Complex128Array( 16 );
* var WORK = new Complex128Array( 8 );
* // C is overwritten with Q*C in column-major layout.
* zgemlqt.ndarray( 'left', 'no-transpose', 4, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgemlqt from './zgemlqt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgemlqt, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zgemlqt & { ndarray: typeof ndarray }} */ ( zgemlqt );
export { ndarray };
