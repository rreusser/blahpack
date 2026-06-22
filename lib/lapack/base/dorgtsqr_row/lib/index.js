
/**
* Generates an M-by-N real matrix Q with orthonormal columns from the row-blocked output of DLATSQR.
*
* @module @stdlib/lapack/base/dorgtsqr_row
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var dlatsqr = require( '@stdlib/lapack/base/dlatsqr' );
* var dorgtsqr_row = require( '@stdlib/lapack/base/dorgtsqr_row' );
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

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "dorgtsqr_row.ndarray" }
