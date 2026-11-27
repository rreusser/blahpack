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
* DLASYF_RK computes a partial factorization of a real symmetric indefinite matrix using bounded Bunch-Kaufman (rook) diagonal pivoting method, producing _rk format output.
*
* @module @stdlib/lapack/base/dlasyfRk
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import dlasyfRk from '@rreusser/blahpack/lapack/base/dlasyf_rk';
*
* // Symmetric 4x4 matrix (column-major, lower triangle referenced):
* var A = new Float64Array( [ 4.0, 1.0, 2.0, 0.5, 0.0, 3.0, 0.5, 1.0, 0.0, 0.0, 5.0, 0.2, 0.0, 0.0, 0.0, 6.0 ] );
* var e = new Float64Array( 4 );
* var IPIV = new Int32Array( 4 );
* var kb = new Int32Array( 1 );
* var W = new Float64Array( 16 );
*
* dlasyfRk( 'column-major', 'lower', 4, 4, kb, A, 4, e, 1, IPIV, 1, W, 4 );
*
* // kb[ 0 ] => 4
*
* // No pivoting is needed, so A = L*D*L^T with diagonal D:
* // IPIV => <Int32Array>[ 0, 1, 2, 3 ]
* // [ A[ 0 ], A[ 5 ], A[ 10 ], A[ 15 ] ] => [ 4.0, 2.75, 4.0, ~5.6585 ]
* // A[ 1 ] => 0.25
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlasyfRk from './dlasyf_rk.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlasyfRk, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dlasyfRk & { ndarray: typeof ndarray }} */ ( dlasyfRk );
export { ndarray };
