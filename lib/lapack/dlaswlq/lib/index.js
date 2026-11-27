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
* Computes a blocked Tall-Skinny LQ (TSLQ) factorization of a real `M`-by-`N` matrix (with `M <= N`).
*
* ## Notes
*
* -   The factorization is appropriate for short-wide matrices where `N >> M`. The first column block of size `M`-by-`nb` is factored via `dgelqt`; subsequent column blocks are combined into the running `L` factor via `dtplqt`.
* -   `T` has dimensions `mb`-by-`(M * Number_of_row_blocks)` where `Number_of_row_blocks = ceil((N-M)/(nb-M))`. When `M >= N`, `nb <= M`, or `nb >= N`, the routine simply calls `dgelqt` and `T` is `mb`-by-`M`.
* -   The orthogonal factor `Q` is represented implicitly by the Householder reflectors stored above the diagonal of `A` together with `T`.
*
* @module @rreusser/blahpack/lapack/dlaswlq
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlaswlq from '@rreusser/blahpack/lapack/dlaswlq';
*
* var A = new Float64Array( [ 5.0, 1.0, 0.5, 0.3, 1.0, 6.0, 0.5, 0.5 ] );
* var T = new Float64Array( 4 );
* var WORK = new Float64Array( 4 );
*
* var info = dlaswlq( 'column-major', 2, 4, 2, 8, A, 2, T, 2, WORK );
* // returns 0
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaswlq from './dlaswlq.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaswlq, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlaswlq & { ndarray: typeof ndarray }} */ ( dlaswlq );
export { ndarray };
