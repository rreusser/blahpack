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
* Applies a complex elementary reflector defined by RZ factorization.
*
* ## Notes
*
* -   `zlarz` applies a complex elementary reflector `H = I - tau * v * v^H` to `C`, where `v` has the compressed form used by the `RZ` factorization (see `ztzrzf`): the first component of `v` is implicitly unity, and only the last `l` components are stored in the `v` argument.
* -   If `tau = 0`, `H` is taken to be the identity.
*
* @module @rreusser/blahpack/lapack/base/zlarz
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlarz from '@rreusser/blahpack/lapack/base/zlarz';
*
* var v = new Complex128Array( [ 0.5, 0.2, -0.3, 0.4 ] );
* var tau = new Complex128Array( [ 1.2, -0.4 ] );
* var C = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5, -1.0, 2.0, 0.5, 0.5, 1.5, -0.5, -2.0, 1.0, 0.0, 1.0, 1.0, 1.0, -0.5, 0.0, 2.0, -2.0 ] );
* var WORK = new Complex128Array( 3 );
*
* zlarz( 'column-major', 'left', 4, 3, 2, v, 1, tau, 0, C, 4, WORK, 1 );
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zlarz from '@rreusser/blahpack/lapack/base/zlarz';
*
* var v = new Complex128Array( [ 0.5, 0.2, -0.3, 0.4 ] );
* var tau = new Complex128Array( [ 1.2, -0.4 ] );
* var C = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.5, -1.0, 2.0, 0.5, 0.5, 1.5, -0.5, -2.0, 1.0, 0.0, 1.0, 1.0, 1.0, -0.5, 0.0, 2.0, -2.0 ] );
* var WORK = new Complex128Array( 3 );
*
* zlarz.ndarray( 'left', 4, 3, 2, v, 1, 0, tau, 0, C, 1, 4, 0, WORK, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarz from './zlarz.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarz, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zlarz & { ndarray: typeof ndarray }} */ ( zlarz );
export { ndarray };
