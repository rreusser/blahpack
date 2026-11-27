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
* Generates a complex elementary reflector with non-negative beta.
*
* @module @rreusser/blahpack/lapack/base/zlarfgp
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlarfgp from '@rreusser/blahpack/lapack/base/zlarfgp';
*
* var alpha = new Complex128Array( [ 3.0, 0.0 ] );
* var x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
* var tau = new Complex128Array( 1 );
*
* zlarfgp( 3, alpha, 0, x, 1, tau, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarfgp from './zlarfgp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarfgp, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlarfgp & { ndarray: typeof ndarray }} */ ( zlarfgp );
export { ndarray };
