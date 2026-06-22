/**
 * Computes the singular value decomposition (SVD) of a complex M-by-N matrix A.
 * optionally computing the left and/or right singular vectors.
 *
 * The SVD is written: `A = U*SIGMA*conjugate-transpose(V)`
 *
 * where SIGMA is an M-by-N matrix which is zero except for its min(M,N) diagonal
 * elements, U is an M-by-M unitary matrix, and V is an N-by-N unitary matrix.
 * The diagonal elements of SIGMA are the singular values of A; they are real and
 * non-negative, and are returned in descending order. The first min(M,N) columns
 * of U and V are the left and right singular vectors of A.
 *
 *
 * @param {string} jobu - `'all-columns'`: all M columns of U returned, `'economy'`: first min(M,N) columns, `'overwrite'`: overwrite A, `'none'`: no U
 * @param {string} jobvt - `'all-rows'`: all N rows of V^H returned, `'economy'`: first min(M,N) rows, `'overwrite'`: overwrite A, `'none'`: no VT
 * @param {NonNegativeInteger} M - number of rows of A
 * @param {NonNegativeInteger} N - number of columns of A
 * @param {Complex128Array} A - input/output matrix (column-major)
 * @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @param {Float64Array} s - output array of real singular values (length min(M,N))
 * @param {integer} strideS - stride for s
 * @param {NonNegativeInteger} offsetS - starting index for s
 * @param {Complex128Array} U - output matrix for left singular vectors
 * @param {integer} strideU1 - stride of the first dimension of U (in complex elements)
 * @param {integer} strideU2 - stride of the second dimension of U (in complex elements)
 * @param {NonNegativeInteger} offsetU - starting index for U (in complex elements)
 * @param {Complex128Array} VT - output matrix for right singular vectors
 * @param {integer} strideVT1 - stride of the first dimension of VT (in complex elements)
 * @param {integer} strideVT2 - stride of the second dimension of VT (in complex elements)
 * @param {NonNegativeInteger} offsetVT - starting index for VT (in complex elements)
 * @param {Complex128Array} WORK - complex workspace array
 * @param {integer} strideWORK - stride for WORK (in complex elements)
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
 * @param {integer} lwork - length of WORK array (in complex elements)
 * @param {Float64Array} RWORK - real workspace array (length >= 5*min(M,N))
 * @param {integer} strideRWORK - stride for RWORK
 * @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
 * @returns {integer} info - 0 if successful, >0 if ZBDSQR did not converge
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the singular value decomposition (SVD) of a complex M-by-N matrix A.
*
* @param {string} jobu - `'all-columns'`: all M columns of U returned, `'economy'`: first min(M,N) columns, `'overwrite'`: overwrite A, `'none'`: no U
* @param {string} jobvt - `'all-rows'`: all N rows of V^H returned, `'economy'`: first min(M,N) rows, `'overwrite'`: overwrite A, `'none'`: no VT
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Complex128Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} s - output array of real singular values (length min(M,N))
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - starting index for s
* @param {Complex128Array} U - output matrix for left singular vectors
* @param {integer} strideU1 - stride of the first dimension of U (in complex elements)
* @param {integer} strideU2 - stride of the second dimension of U (in complex elements)
* @param {NonNegativeInteger} offsetU - starting index for U (in complex elements)
* @param {Complex128Array} VT - output matrix for right singular vectors
* @param {integer} strideVT1 - stride of the first dimension of VT (in complex elements)
* @param {integer} strideVT2 - stride of the second dimension of VT (in complex elements)
* @param {NonNegativeInteger} offsetVT - starting index for VT (in complex elements)
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @param {integer} lwork - length of WORK array (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length >= 5*min(M,N))
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @throws {TypeError} first argument must be a valid job type
* @throws {TypeError} second argument must be a valid job type
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {integer} info - 0 if successful, >0 if ZBDSQR did not converge
*/
function zgesvd( jobu, jobvt, M, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, U, strideU1, strideU2, offsetU, VT, strideVT1, strideVT2, offsetVT, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK ) {
	if ( jobu !== 'all-columns' && jobu !== 'economy' && jobu !== 'overwrite' && jobu !== 'none' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job type. Value: `%s`.', jobu ) );
	}
	if ( jobvt !== 'all-rows' && jobvt !== 'economy' && jobvt !== 'overwrite' && jobvt !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid job type. Value: `%s`.', jobvt ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( jobu, jobvt, M, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, U, strideU1, strideU2, offsetU, VT, strideVT1, strideVT2, offsetVT, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK );
}


// EXPORTS //

export default zgesvd;
