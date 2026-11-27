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
* Applies one step of incremental condition estimation.
*
* @module @rreusser/blahpack/lapack/base/dlaic1
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlaic1 from '@rreusser/blahpack/lapack/base/dlaic1';
*
* var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
* var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var sestpr = new Float64Array( 1 );
* var s = new Float64Array( 1 );
* var c = new Float64Array( 1 );
*
* dlaic1( 'largest-singular-value', 3, x, 1, 5.0, w, 1, 2.0, sestpr, s, c );
* // sestpr[ 0 ] => ~5.5289
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaic1 from './dlaic1.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaic1, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlaic1 & { ndarray: typeof ndarray }} */ ( dlaic1 );
export { ndarray };
