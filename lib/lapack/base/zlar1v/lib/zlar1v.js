/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the (scaled) `r`-th column of the inverse of the submatrix in rows `b1` through `bn` of the tridiagonal matrix `L*D*L^T - lambda*I` (complex eigenvector container).
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {integer} b1 - (1-based) first index of the submatrix
* @param {integer} bn - (1-based) last index of the submatrix
* @param {number} lambda - shift (approximate eigenvalue)
* @param {Float64Array} D - diagonal of `L*D*L^T`
* @param {integer} strideD - stride length for `D`
* @param {Float64Array} L - sub-diagonal of the unit lower bidiagonal factor
* @param {integer} strideL - stride length for `L`
* @param {Float64Array} LD - element-wise product `L*D`
* @param {integer} strideLD - stride length for `LD`
* @param {Float64Array} LLD - element-wise product `L*D*L`
* @param {integer} strideLLD - stride length for `LLD`
* @param {number} pivmin - minimum pivot in the Sturm sequence
* @param {number} gaptol - tolerance that determines when a column of the inverse has converged
* @param {Complex128Array} Z - output eigenvector (length `N`)
* @param {integer} strideZ - stride length for `Z`
* @param {boolean} wantnc - if `true`, compute `negcnt`
* @param {Int32Array} negcnt - output (length >= 1)
* @param {Float64Array} ztz - output (length >= 1)
* @param {Float64Array} mingma - output (length >= 1)
* @param {Int32Array} r - in/out (length >= 1)
* @param {Int32Array} ISUPPZ - output (length >= 2)
* @param {integer} strideISUPPZ - stride length for `ISUPPZ`
* @param {Float64Array} nrminv - output (length >= 1)
* @param {Float64Array} resid - output (length >= 1)
* @param {Float64Array} rqcorr - output (length >= 1)
* @param {Float64Array} WORK - workspace (length >= 4*N)
* @param {integer} strideWORK - stride length for `WORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {void}
*/
function zlar1v( N, b1, bn, lambda, D, strideD, L, strideL, LD, strideLD, LLD, strideLLD, pivmin, gaptol, Z, strideZ, wantnc, negcnt, ztz, mingma, r, ISUPPZ, strideISUPPZ, nrminv, resid, rqcorr, WORK, strideWORK ) {
	var oISUPPZ;
	var oWORK;
	var oLLD;
	var oLD;
	var oD;
	var oL;
	var oZ;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	oD = stride2offset( N, strideD );
	oL = stride2offset( N, strideL );
	oLD = stride2offset( N, strideLD );
	oLLD = stride2offset( N, strideLLD );
	oZ = stride2offset( N, strideZ );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 4 * N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	oWORK = stride2offset( 4 * N, strideWORK );
	oISUPPZ = stride2offset( 2, strideISUPPZ );
	base( N, b1, bn, lambda, D, strideD, oD, L, strideL, oL, LD, strideLD, oLD, LLD, strideLLD, oLLD, pivmin, gaptol, Z, strideZ, oZ, wantnc, negcnt, ztz, mingma, r, ISUPPZ, strideISUPPZ, oISUPPZ, nrminv, resid, rqcorr, WORK, strideWORK, oWORK );
}


// EXPORTS //

export default zlar1v;
