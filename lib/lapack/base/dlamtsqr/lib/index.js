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
* Apply an orthogonal matrix from a blocked Tall-Skinny QR (TSQR) factorization to a real `M`-by-`N` matrix.
*
* @module @rreusser/blahpack/lapack/base/dlamtsqr
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlatsqr from '@rreusser/blahpack/lapack/base/dlatsqr';
* import dlamtsqr from '@rreusser/blahpack/lapack/base/dlamtsqr';
*
* // Tall-skinny 4x2 matrix (column-major) with columns [ 1, 2, 2, 0 ] and [ 0, 1, 1, 1 ]:
* var A0 = [ 1.0, 2.0, 2.0, 0.0, 0.0, 1.0, 1.0, 1.0 ];
* var A = new Float64Array( A0 );
* var T = new Float64Array( 8 );
* var WORK = new Float64Array( 8 );
*
* // Factor A = Q*R with row block mb = 3 and column block nb = 2:
* dlatsqr( 'column-major', 4, 2, 3, 2, A, 4, T, 2, WORK );
*
* // Apply Q^T from the left to a copy of the original matrix, recovering R:
* var C = new Float64Array( A0 );
* var info = dlamtsqr( 'column-major', 'left', 'transpose', 4, 2, 2, 3, 2, A, 4, T, 2, C, 4, WORK );
* // returns 0
*
* // C => <Float64Array>[ -3.0, 0.0, 0.0, 0.0, ~-1.3333, ~1.1055, 0.0, 0.0 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlamtsqr from './dlamtsqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlamtsqr, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlamtsqr & { ndarray: typeof ndarray }} */ ( dlamtsqr );
export { ndarray };
