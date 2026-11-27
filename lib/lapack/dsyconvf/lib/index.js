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
* LAPACK routine to convert the factorization output format used in `dsytrf` to the format used in `dsytrf_rk` and vice versa.
*
* ## Notes
*
* -   `IPIV` uses 0-based indices. A negative entry `v` encodes the upper (or lower) element of a 2x2 pivot block and represents the 0-based row index `~v` (bitwise NOT).
* -   When `way = 'convert'`, the routine extracts the off-diagonal entries of the block-diagonal factor `D` into `E` and rewrites `IPIV` into the `dsytrf_rk` format. When `way = 'revert'`, it performs the inverse transformation.
*
* @module @rreusser/blahpack/lapack/dsyconvf
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dsyconvf from '@rreusser/blahpack/lapack/dsyconvf';
*
* var A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 5.0, 0.0, 3.0, 6.0, 9.0 ] );
* var E = new Float64Array( 3 );
* var IPIV = new Int32Array( [ 0, 1, 2 ] );
*
* dsyconvf( 'column-major', 'upper', 'convert', 3, A, 3, E, 1, IPIV, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsyconvf from './dsyconvf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsyconvf, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dsyconvf & { ndarray: typeof ndarray }} */ ( dsyconvf );
export { ndarray };
