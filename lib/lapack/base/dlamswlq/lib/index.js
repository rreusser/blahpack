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
* Apply an orthogonal matrix from a blocked Short-Wide LQ (SWLQ) factorization to a real `M`-by-`N` matrix.
*
* @module @rreusser/blahpack/lapack/base/dlamswlq
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlaswlq from '@rreusser/blahpack/lapack/base/dlaswlq';
* import dlamswlq from '@rreusser/blahpack/lapack/base/dlamswlq';
*
* // Short-wide 2x4 matrix (column-major) A = [ [ 1, 2, 0, 1 ], [ 0, 1, 3, 1 ] ]:
* var A0 = [ 1.0, 0.0, 2.0, 1.0, 0.0, 3.0, 1.0, 1.0 ];
* var A = new Float64Array( A0 );
* var T = new Float64Array( 8 );
* var WORK = new Float64Array( 4 );
*
* // Factor A = L*Q with row block mb = 2 and column block nb = 3:
* dlaswlq( 'column-major', 2, 4, 2, 3, A, 2, T, 2, WORK );
*
* // Apply Q^T from the right to a copy of the original matrix, recovering L:
* var C = new Float64Array( A0 );
* var info = dlamswlq( 'column-major', 'right', 'transpose', 2, 4, 2, 2, 3, A, 2, T, 2, C, 2, WORK );
* // returns 0
*
* // L[0][0] = ||row 0|| = sqrt( 6 ), L[1][1] = sqrt( 9.5 ):
* // C[ 0 ] => ~2.4495
* // C[ 1 ] => ~1.2247
* // C[ 3 ] => ~3.0822
*/

// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dlamswlq.ndarray" }
