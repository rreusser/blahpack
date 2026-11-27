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
* Solves a real quasi-triangular system of equations.
*
* @module @rreusser/blahpack/lapack/base/dlaqtr
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlaqtr from '@rreusser/blahpack/lapack/base/dlaqtr';
*
* var T = new Float64Array([ 2.0, 0.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.0, 3.0, -1.0, 4.0, 0.0, 0.0, 0.0, 0.0, 0.0 ]);
* var b = new Float64Array( 4 );
* var scale = new Float64Array( 1 );
* var x = new Float64Array([ 10.0, 5.0, 8.0 ]);
* var WORK = new Float64Array( 3 );
*
* var info = dlaqtr( 'column-major', false, true, 3, T, 4, b, 1, 0.0, scale, x, 1, WORK );
* // returns 0
*
* // Solution of T*x = scale*[ 10, 5, 8 ]:
* // scale[ 0 ] => 1.0
* // x => <Float64Array>[ ~0.833333, ~2.333333, 2.0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqtr from './dlaqtr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqtr, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlaqtr & { ndarray: typeof ndarray }} */ ( dlaqtr );
export { ndarray };
