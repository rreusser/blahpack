
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a real.
* symmetric tridiagonal matrix A.
*
* Eigenvalues and eigenvectors can be selected by specifying either a
* range of values or a range of indices for the desired eigenvalues.
*
* @param {string} jobz - 'no-vectors' or 'compute-vectors'
* @param {string} range - 'all', 'value', or 'index'
* @param {NonNegativeInteger} N - order of the tridiagonal matrix
* @param {Float64Array} d - diagonal elements (length N), may be modified
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Float64Array} e - subdiagonal elements (length N-1), may be modified
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - offset for e
* @param {number} vl - lower bound of value interval (range='value')
* @param {number} vu - upper bound of value interval (range='value')
* @param {integer} il - 1-based index of smallest eigenvalue (range='index')
* @param {integer} iu - 1-based index of largest eigenvalue (range='index')
* @param {number} abstol - absolute error tolerance for eigenvalues
* @param {Int32Array} M - output: number of eigenvalues found (M[0])
* @param {Float64Array} w - output: selected eigenvalues in ascending order
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - offset for w
* @param {Float64Array} Z - output: eigenvectors (if jobz='compute-vectors')
* @param {integer} strideZ1 - stride of first dimension of Z
* @param {integer} strideZ2 - stride of second dimension of Z
* @param {NonNegativeInteger} offsetZ - offset for Z
* @param {Float64Array} WORK - workspace (length >= 5*N)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - offset for WORK
* @param {Int32Array} IWORK - integer workspace (length >= 5*N)
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - offset for IWORK
* @param {Int32Array} IFAIL - output: indices of non-converged eigenvectors
* @param {integer} strideIFAIL - stride for IFAIL
* @param {NonNegativeInteger} offsetIFAIL - offset for IFAIL
* @returns {integer} info - 0 on success, >0 if eigenvectors failed to converge
*/
function dstevx( jobz, range, N, d, strideD, offsetD, e, strideE, offsetE, vl, vu, il, iu, abstol, M, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ) { // eslint-disable-line max-len, max-params
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid jobz value. Value: `%s`.', jobz ) );
	}
	if ( range !== 'all' && range !== 'value' && range !== 'index' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid range value. Value: `%s`.', range ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	return base( jobz, range, N, d, strideD, offsetD, e, strideE, offsetE, vl, vu, il, iu, abstol, M, w, strideW, offsetW, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ); // eslint-disable-line max-len
}


// EXPORTS //

export default dstevx;
