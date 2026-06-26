/**
* Compute the (scaled) `r`-th column of the inverse of the submatrix in rows `b1` through `bn` of the tridiagonal matrix `L*D*L^T - lambda*I` (complex eigenvector container).
*
* @module @stdlib/lapack/base/zlar1v
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
* var Complex128Array = require( '@stdlib/array/complex128' );
* var zlar1v = require( '@stdlib/lapack/base/zlar1v' );
*
* var D = new Float64Array( [ 4.0, 3.75, 3.7333333333333334, 3.732142857142857, 3.7320574162679425 ] );
* var L = new Float64Array( [ 0.25, 0.26666666666666666, 0.26785714285714285, 0.26794258373205743, 0.0 ] );
* var LD = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 0.0 ] );
* var LLD = new Float64Array( [ 0.25, 0.26666666666666666, 0.26785714285714285, 0.26794258373205743, 0.0 ] );
*
* var Z = new Complex128Array( 5 );
* var WORK = new Float64Array( 20 );
* var ISUPPZ = new Int32Array( 2 );
* var negcnt = new Int32Array( 1 );
* var ztz = new Float64Array( 1 );
* var mingma = new Float64Array( 1 );
* var r = new Int32Array( 1 );
* var nrminv = new Float64Array( 1 );
* var resid = new Float64Array( 1 );
* var rqcorr = new Float64Array( 1 );
*
* zlar1v( 5, 1, 5, 4.0 - Math.sqrt( 3.0 ), D, 1, L, 1, LD, 1, LLD, 1, 1e-300, 0.0, Z, 1, true, negcnt, ztz, mingma, r, ISUPPZ, 1, nrminv, resid, rqcorr, WORK, 1 );
*/


// MODULES //

import main from './main.js';


// EXPORTS //

export default main;

// exports: { "ndarray": "zlar1v.ndarray" }
