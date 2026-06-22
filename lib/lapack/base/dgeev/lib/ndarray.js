

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Computes the eigenvalues and, optionally, the left and/or right eigenvectors
 * of a real N-by-N nonsymmetric matrix A.
 *
 * The right eigenvector v(j) of A satisfies A * v(j) = lambda(j) * v(j).
 * The left eigenvector u(j) of A satisfies u(j)**H * A = lambda(j) * u(j)**H.
 *
 * The computed eigenvectors are normalized to have Euclidean norm equal to 1
 * and largest component real.
 *
 *
 * @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
 * @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
 * @param {NonNegativeInteger} N - order of matrix A
 * @param {Float64Array} A - input matrix (N x N), overwritten on exit
 * @param {integer} strideA1 - first dimension stride of A
 * @param {integer} strideA2 - second dimension stride of A
 * @param {NonNegativeInteger} offsetA - starting index for A
 * @param {Float64Array} WR - output: real parts of eigenvalues (length N)
 * @param {integer} strideWR - stride for WR
 * @param {NonNegativeInteger} offsetWR - offset for WR
 * @param {Float64Array} WI - output: imaginary parts of eigenvalues (length N)
 * @param {integer} strideWI - stride for WI
 * @param {NonNegativeInteger} offsetWI - offset for WI
 * @param {Float64Array} VL - output: left eigenvectors (N x N), not referenced if jobvl=`'no-vectors'`
 * @param {integer} strideVL1 - first dimension stride of VL
 * @param {integer} strideVL2 - second dimension stride of VL
 * @param {NonNegativeInteger} offsetVL - offset for VL
 * @param {Float64Array} VR - output: right eigenvectors (N x N), not referenced if jobvr=`'no-vectors'`
 * @param {integer} strideVR1 - first dimension stride of VR
 * @param {integer} strideVR2 - second dimension stride of VR
 * @param {NonNegativeInteger} offsetVR - offset for VR
 * @returns {integer} info - 0 on success, >0 if QR failed (eigenvalues info+1:N have converged)
 */
function dgeev( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid jobvl value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid jobvr value. Value: `%s`.', jobvr ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, strideWORK, offsetWORK, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgeev;
