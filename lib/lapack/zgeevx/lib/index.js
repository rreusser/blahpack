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
* Computes eigenvalues, eigenvectors, and reciprocal condition numbers for a complex nonsymmetric matrix.
*
* @module @rreusser/blahpack/lapack/base/zgeevx
*
* @example
* import zgeevx from '@rreusser/blahpack/lapack/base/zgeevx';
* // See examples/index.js
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeevx from './zgeevx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgeevx, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zgeevx & { ndarray: typeof ndarray }} */ ( zgeevx );
export { ndarray };
