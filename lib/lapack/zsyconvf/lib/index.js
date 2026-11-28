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
* Converts the factorization output format used in zsytrf for complex symmetric matrices.
*
* ## Notes
*
* -   When `way='convert'`, the routine extracts the off-diagonal elements of the 2x2 blocks of `D` from `A` into `E`, zeros them in `A`, and rewrites the second entry of each 2x2 `IPIV` pair to be self-pivoting.
* -   When `way='revert'`, the routine performs the inverse operation, reinserting `E` into `A` and restoring the original `IPIV` encoding.
* -   `A` and `E` are `Complex128Array`s; `IPIV` is an `Int32Array` of 0-based indices where negative values encode 2x2 pivot blocks.
* -   No conjugation is performed: this routine treats `A` as symmetric, not Hermitian.
*
* @module @rreusser/blahpack/lapack/zsyconvf
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zsyconvf from '@rreusser/blahpack/lapack/zsyconvf';
*
* var A = new Complex128Array( 4 );
* var E = new Complex128Array( 2 );
* var IPIV = new Int32Array( [ 0, 1 ] );
*
* zsyconvf( 'column-major', 'upper', 'convert', 2, A, 2, E, 1, IPIV, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsyconvf from './zsyconvf.js';
import strided from './strided.js';


// MAIN //

setReadOnly( zsyconvf, 'strided', strided );


// EXPORTS //

export default /** @type {typeof zsyconvf & { strided: typeof strided }} */ ( zsyconvf );
export { strided };
