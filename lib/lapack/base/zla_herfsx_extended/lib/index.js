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
* Extra-precise iterative refinement for Hermitian indefinite linear systems.
*
* @module @rreusser/blahpack/lapack/base/zla_herfsx_extended
*
* @example
* import zlaHerfsxExtended from '@rreusser/blahpack/lapack/base/zla_herfsx_extended';
*
* // See examples/index.js for a complete runnable example.
* console.log( typeof zlaHerfsxExtended );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaHerfsxExtended from './zla_herfsx_extended.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaHerfsxExtended, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlaHerfsxExtended & { ndarray: typeof ndarray }} */ ( zlaHerfsxExtended );
export { ndarray };
