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
* Estimate reciprocal condition number of a complex Hermitian matrix using rook-pivoted factorization.
*
* ## Notes
*
* -   IPIV uses the same Fortran 1-based encoding as `zhetrf_rook`: positive values are 1x1 pivots; negative values encode 2x2 pivots.
* -   The Hermitian diagonal of `A` is real; the routine checks only the real part when detecting singular `D`.
*
* @module @rreusser/blahpack/lapack/base/zhecon_rook
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zheconRook from '@rreusser/blahpack/lapack/base/zhecon_rook';
*
* var N = 3;
* var A = new Complex128Array( [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ] );
* var ipiv = new Int32Array( [ 0, 1, 2 ] );
* var work = new Complex128Array( 2*N );
* var rcond = new Float64Array( 1 );
*
* zheconRook.ndarray( 'upper', N, A, 1, N, 0, ipiv, 1, 0, 1.0, rcond, work, 1, 0 );
* // rcond[ 0 ] => 1
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zheconRook from './zhecon_rook.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zheconRook, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zheconRook & { ndarray: typeof ndarray }} */ ( zheconRook );
export { ndarray };
