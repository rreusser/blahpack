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
* Executes a single multishift QZ sweep on a matrix pencil.
*
* @module @rreusser/blahpack/lapack/base/dlaqz4
*
* @example
* import dlaqz4 from '@rreusser/blahpack/lapack/base/dlaqz4';
*
* // See `examples/index.js` for a runnable example.
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqz4 from './dlaqz4.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqz4, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlaqz4 & { ndarray: typeof ndarray }} */ ( dlaqz4 );
export { ndarray };
