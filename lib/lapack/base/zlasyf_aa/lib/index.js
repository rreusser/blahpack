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
* Factorize a panel of a complex symmetric matrix using Aasen's algorithm.
*
* ## Notes
*
* -   Implements LAPACK's `ZLASYF_AA`: factorizes a panel of `M` rows or columns of a complex symmetric matrix `A` using Aasen's algorithm.
* -   The panel kernel is intended to be invoked by the higher-level `zsytrf_aa` driver, which is responsible for initializing the first column of the workspace `H` to the corresponding column (or row, for `'upper'`) of `A`.
* -   `IPIV` entries are stored as 0-based row/column indices.
* -   Unlike Hermitian variants (`zhetrf_aa`), all arithmetic is fully complex with no conjugation at mirror reads or real-only-diagonal forcing.
*
* @module @rreusser/blahpack/lapack/base/zlasyf_aa
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zlasyfAa from '@rreusser/blahpack/lapack/base/zlasyf_aa';
*
* var A = new Complex128Array( 9 );
* var H = new Complex128Array( 9 );
* var WORK = new Complex128Array( 3 );
* var IPIV = new Int32Array( 3 );
*
* zlasyfAa( 'column-major', 'lower', 1, 3, 3, A, 3, IPIV, 1, 0, H, 3, WORK, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlasyfAa from './zlasyf_aa.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlasyfAa, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlasyfAa & { ndarray: typeof ndarray }} */ ( zlasyfAa );
export { ndarray };
