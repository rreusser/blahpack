
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues and, optionally, the left and/or right eigenvectors.
* of a complex N-by-N nonsymmetric matrix A.
*
* The right eigenvector v(j) of A satisfies A _ v(j) = lambda(j) _ v(j).
* The left eigenvector u(j) of A satisfies u(j)**H _ A = lambda(j) _ u(j)**H.
*
* The computed eigenvectors are normalized to have Euclidean norm equal to 1
* and largest component real.
*
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {Complex128Array} A - input matrix (N x N), overwritten on exit
* @param {integer} strideA1 - first dimension stride of A (complex elements)
* @param {integer} strideA2 - second dimension stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} w - output: eigenvalues (length N)
* @param {integer} strideW - stride for w (complex elements)
* @param {NonNegativeInteger} offsetW - starting index for w (complex elements)
* @param {Complex128Array} VL - output: left eigenvectors (N x N)
* @param {integer} strideVL1 - first dimension stride of VL (complex elements)
* @param {integer} strideVL2 - second dimension stride of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - starting index for VL (complex elements)
* @param {Complex128Array} VR - output: right eigenvectors (N x N)
* @param {integer} strideVR1 - first dimension stride of VR (complex elements)
* @param {integer} strideVR2 - second dimension stride of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - starting index for VR (complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {integer} lwork - workspace length (complex elements)
* @param {Float64Array} RWORK - real workspace (length >= 2*N)
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 on success, >0 if QR failed (eigenvalues info+1:N have converged)
*/
function zgeev( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid jobvl value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid jobvr value. Value: `%s`.', jobvr ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgeev;
