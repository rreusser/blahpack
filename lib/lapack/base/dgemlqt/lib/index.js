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
* Overwrites a real M-by-N matrix C with `op(Q)*C` or `C*op(Q)` using the compact WY representation produced by `dgelqt`.
*
* @module @rreusser/blahpack/lapack/base/dgemlqt
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgemlqt from '@rreusser/blahpack/lapack/base/dgemlqt';
*
* var V = new Float64Array( 12 );
* var T = new Float64Array( 6 );
* var C = new Float64Array( 16 );
* var WORK = new Float64Array( 8 );
* // C is overwritten with Q*C in column-major layout.
* dgemlqt.ndarray( 'left', 'no-transpose', 4, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgemlqt from './dgemlqt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgemlqt, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dgemlqt & { ndarray: typeof ndarray }} */ ( dgemlqt );
export { ndarray };
