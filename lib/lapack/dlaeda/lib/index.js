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
* Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC.
*
* @module @rreusser/blahpack/lapack/base/dlaeda
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dlaeda from '@rreusser/blahpack/lapack/base/dlaeda';
*
* var N = 4;
* var QPTR = new Int32Array( [ 1, 5, 9 ] );
* var q = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 ] );
* var z = new Float64Array( N );
* var ZTEMP = new Float64Array( N );
* var prmptr = new Int32Array( 4 );
* var perm = new Int32Array( 4 );
* var givptr = new Int32Array( 4 );
* var givcol = new Int32Array( 2 * 4 );
* var givnum = new Float64Array( 2 * 4 );
*
* // Two 2-by-2 eigenblocks (column-major) stored at q[0..3] and q[4..7]:
* var info = dlaeda( 'column-major', N, 1, 1, 0, prmptr, 1, perm, 1, givptr, 1, givcol, 2, givnum, 2, q, 1, QPTR, 1, z, 1, ZTEMP, 1 );
* // returns 0
*
* // z holds the last row of the first block and the first row of the second:
* // z => <Float64Array>[ 2.0, 4.0, 5.0, 7.0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaeda from './dlaeda.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaeda, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlaeda & { ndarray: typeof ndarray }} */ ( dlaeda );
export { ndarray };
