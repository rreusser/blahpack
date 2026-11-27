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
* Generates a real elementary reflector with non-negative beta.
*
* @module @rreusser/blahpack/lapack/base/dlarfgp
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlarfgp from '@rreusser/blahpack/lapack/base/dlarfgp';
*
* var alpha = new Float64Array( [ 3.0 ] );
* var x = new Float64Array( [ 4.0, 0.0, 0.0 ] );
* var tau = new Float64Array( 1 );
*
* dlarfgp( 4, alpha, x, 1, tau );
* // alpha => <Float64Array>[ 5.0 ]
* // tau => <Float64Array>[ 0.4 ]
* // x => <Float64Array>[ -2.0, 0.0, 0.0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarfgp from './dlarfgp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarfgp, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlarfgp & { ndarray: typeof ndarray }} */ ( dlarfgp );
export { ndarray };
