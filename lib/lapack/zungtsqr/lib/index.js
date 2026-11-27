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
* Generates an M-by-N complex matrix Q with orthonormal columns from a Tall-Skinny QR factorization (output of zlatsqr).
*
* ## Notes
*
* -   `Q` is formed by applying the unitary factor `Q` (from `zlatsqr`) to the `M`-by-`N` identity via `zlamtsqr` and copying the result back into `A`.
*
* @module @rreusser/blahpack/lapack/base/zungtsqr
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zungtsqr from './zungtsqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zungtsqr, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zungtsqr & { ndarray: typeof ndarray }} */ ( zungtsqr );
export { ndarray };
