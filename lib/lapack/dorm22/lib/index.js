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
* Multiplies a general matrix by a banded orthogonal matrix.
*
* ## Notes
*
* -   The orthogonal matrix `Q` is assumed to have a 2x2 block structure: an upper-left rectangular block, a lower-triangular block, an upper-triangular block, and a lower-right rectangular block. It is typically produced by the multi-shift QR iteration (`dlaqr2`/`dlaqr3`).
*
* @module @rreusser/blahpack/lapack/dorm22
*
* @example
* import uniform from '@stdlib/random/array/uniform/lib/index.js';
* import dorm22 from '@rreusser/blahpack/lapack/dorm22';
*
* var Q = uniform( 25, -1.0, 1.0, { 'dtype': 'float64' } );
* var C = uniform( 20, -1.0, 1.0, { 'dtype': 'float64' } );
* var WORK = uniform( 20, 0.0, 1.0, { 'dtype': 'float64' } );
*
* dorm22( 'column-major', 'left', 'no-transpose', 5, 4, 3, 2, Q, 5, C, 5, WORK, 1, 20 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorm22 from './dorm22.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorm22, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dorm22 & { ndarray: typeof ndarray }} */ ( dorm22 );
export { ndarray };
