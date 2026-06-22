
// MODULES //

import dlamch from '../../dlamch/lib/base.js';
import dlanst from '../../dlanst/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dsterf from '../../dsterf/lib/base.js';
import dsteqr from '../../dsteqr/lib/base.js';


// VARIABLES //

var SAFMIN = dlamch( 'safe-minimum' );
var EPS = dlamch( 'epsilon' );
var SMLNUM = SAFMIN / EPS;
var BIGNUM = 1.0 / SMLNUM;
var RMIN = Math.sqrt( SMLNUM );
var RMAX = Math.sqrt( BIGNUM );


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric.
* tridiagonal matrix A.
*
* The eigenvalues are returned in ascending order in D. If eigenvectors are
* requested (JOBZ = 'V'), the matrix Z is filled with orthonormal eigenvectors.
*
* Algorithm:
* 1. Scale the tridiagonal matrix if the norm is outside safe range
* 2. If eigenvalues only (jobz=`'no-vectors'`): compute via dsterf
*    If eigenvectors too (jobz=`'compute-vectors'`): compute via dsteqr with 'I' (identity start)
* 3. Undo scaling on eigenvalues if needed
*
* @private
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements (length N); on exit, eigenvalues in ascending order
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - off-diagonal elements (length N-1); destroyed on exit
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Float64Array} Z - output matrix for eigenvectors (N x N) if jobz=`'compute-vectors'`; not referenced if jobz=`'no-vectors'`
* @param {integer} strideZ1 - stride of the first dimension of Z
* @param {integer} strideZ2 - stride of the second dimension of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Float64Array} WORK - workspace array (length max(1, 2*N-2)) if jobz=`'compute-vectors'`; not referenced if jobz=`'no-vectors'`
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {integer} info - 0 if successful, >0 if dsteqr/dsterf did not converge
*/
function dstev( jobz, N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	var iscale;
	var wantz;
	var sigma;
	var tnrm;
	var info;
	var imax;

	wantz = ( jobz === 'compute-vectors' );

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	if ( N === 1 ) {
		if ( wantz ) {
			Z[ offsetZ ] = 1.0;
		}
		return 0;
	}

	// Scale matrix to allowable range, if necessary
	tnrm = dlanst( 'max', N, d, strideD, offsetD, e, strideE, offsetE );
	iscale = 0;
	sigma = 1.0;
	if ( tnrm > 0.0 && tnrm < RMIN ) {
		iscale = 1;
		sigma = RMIN / tnrm;
	} else if ( tnrm > RMAX ) {
		iscale = 1;
		sigma = RMAX / tnrm;
	}
	if ( iscale === 1 ) {
		dscal( N, sigma, d, strideD, offsetD );
		dscal( N - 1, sigma, e, strideE, offsetE );
	}

	// For eigenvalues only, call dsterf. For eigenvalues and eigenvectors, call dsteqr.
	if ( !wantz ) {
		info = dsterf( N, d, strideD, offsetD, e, strideE, offsetE );
	} else {
		// 'initialize' = start from identity matrix (compute eigenvectors from scratch)
		info = dsteqr( 'initialize', N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK );
	}

	// If matrix was scaled, rescale eigenvalues
	if ( iscale === 1 ) {
		if ( info === 0 ) {
			imax = N;
		} else {
			imax = info - 1;
		}
		dscal( imax, 1.0 / sigma, d, strideD, offsetD );
	}

	return info;
}


// EXPORTS //

export default dstev;
