
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


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
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 if dsteqr/dsterf did not converge
*/
function dstev( jobz, N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid jobz value. Value: `%s`.', jobz ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( jobz, N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dstev;
