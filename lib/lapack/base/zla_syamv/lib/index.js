/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable camelcase */

/**
* Computes `y := alpha*|A|*|x| + beta*|y|` using a complex symmetric matrix to calculate error bounds.
*
* @module @rreusser/blahpack/lapack/base/zla_syamv
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import zla_syamv from '@rreusser/blahpack/lapack/base/zla_syamv';
*
* var A = new Complex128Array( [ 1.0, 2.0, -2.0, 1.0, -2.0, 1.0, 5.0, 0.0 ] );
* var x = new Complex128Array( [ 1.0, -1.0, -2.0, 0.5 ] );
* var y = new Float64Array( [ 0.0, 0.0 ] );
*
* zla_syamv( 'row-major', 'upper', 2, 1.0, A, 2, x, 1, 0.0, y, 1 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zla_syamv from './zla_syamv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zla_syamv, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zla_syamv & { ndarray: typeof ndarray }} */ ( zla_syamv );
export { ndarray };
