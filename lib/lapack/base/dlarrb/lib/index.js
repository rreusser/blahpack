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
* Provides limited bisection to locate eigenvalues of a symmetric tridiagonal matrix for more accuracy.
*
* @module @rreusser/blahpack/lapack/base/dlarrb
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dlarrb from '@rreusser/blahpack/lapack/base/dlarrb';
*
* var d = new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] );
* var LLD = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
* var w = new Float64Array( [ 1.1, 2.9, 5.2, 6.8 ] );
* var WERR = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
* var WGAP = new Float64Array( [ 1.5, 1.5, 1.5, 0.0 ] );
* var WORK = new Float64Array( 8 );
* var IWORK = new Int32Array( 8 );
*
* // T = diag( 1, 3, 5, 7 ); refine the approximations in `w` by bisection:
* var info = dlarrb( 4, d, 1, LLD, 1, 1, 4, 1.0e-8, 1.0e-14, 0, w, 1, WGAP, 1, WERR, 1, WORK, IWORK, 2.2e-308, 6.0, -1 );
* // returns 0
* // w => <Float64Array>[ ~1.0, ~3.0, ~5.0, ~7.0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarrb from './dlarrb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarrb, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlarrb & { ndarray: typeof ndarray }} */ ( dlarrb );
export { ndarray };
