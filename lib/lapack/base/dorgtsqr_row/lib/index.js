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
* Generates an M-by-N real matrix Q with orthonormal columns from the row-blocked output of DLATSQR.
*
* @module @rreusser/blahpack/lapack/base/dorgtsqr_row
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlatsqr from '@rreusser/blahpack/lapack/base/dlatsqr';
* import dorgtsqr_row from '@rreusser/blahpack/lapack/base/dorgtsqr_row';
*
* var M = 4;
* var N = 3;
* var MB = 8;
* var NB = 2;
* var A = new Float64Array( [ 5.0, 0.5, 0.333, 0.25, 0.5, 6.0, 0.5, 0.333, 0.333, 0.5, 7.0, 0.5 ] );
* var T = new Float64Array( NB * N );
* var W1 = new Float64Array( NB * N );
* var W2 = new Float64Array( NB * NB );
*
* dlatsqr.ndarray( M, N, MB, NB, A, 1, M, 0, T, 1, NB, 0, W1, 1, 0 );
* dorgtsqr_row.ndarray( M, N, MB, NB, A, 1, M, 0, T, 1, NB, 0, W2, 1, 0 );
* // A now holds the M-by-N orthonormal Q.
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorgtsqr_row from './dorgtsqr_row.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorgtsqr_row, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dorgtsqr_row & { ndarray: typeof ndarray }} */ ( dorgtsqr_row );
export { ndarray };
