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
* Estimates the infinity norm condition number for a complex general banded matrix with x scaling.
*
* ## Notes
*
* -   `AB` is the original banded matrix and must be stored with leading dimension `KL+KU+1`.
* -   `AFB` is the LU-factored band matrix from `zgbtrf` and must use leading dimension `2*KL+KU+1`.
* -   `WORK` must provide at least `2*N` complex elements, and `RWORK` at least `N` real elements.
*
* @module @rreusser/blahpack/lapack/base/zla_gbrcond_x
*
* @example
* import zla_gbrcond_x from '@rreusser/blahpack/lapack/base/zla_gbrcond_x';
*
* // See examples/index.js for a full usage example.
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_gbrcond_x from './zla_gbrcond_x.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_gbrcond_x, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zla_gbrcond_x & { ndarray: typeof ndarray }} */ ( zla_gbrcond_x );
export { ndarray };
