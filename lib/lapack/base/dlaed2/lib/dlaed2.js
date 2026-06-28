// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Merges eigenvalues and deflates the secular equation in divide and conquer.
*
* @private
* @param {NonNegativeInteger} N - dimension of the symmetric tridiagonal matrix
* @param {integer} n1 - location of the last eigenvalue in the leading sub-matrix
* @param {Float64Array} d - eigenvalues of the two submatrices (length N)
* @param {Float64Array} Q - eigenvectors (N-by-N, column-major with leading dimension LDQ)
* @param {NonNegativeInteger} LDQ - leading dimension of Q
* @param {Int32Array} INDXQ - permutation sorting each sub-problem (1-based, length N)
* @param {number} rho - off-diagonal element associated with the rank-1 cut
* @param {Float64Array} z - updating vector (length N)
* @param {Float64Array} DLAMBDA - output eigenvalues for secular equation (length N)
* @param {Float64Array} w - output z-vector for secular equation (length N)
* @param {Float64Array} Q2 - output eigenvectors for matrix multiply
* @param {Int32Array} INDX - output permutation (length N)
* @param {Int32Array} INDXC - output permutation (length N)
* @param {Int32Array} INDXP - output permutation (length N)
* @param {Int32Array} COLTYP - output column types (length max(N,4))
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} result with `info`, `K`, and `rho`
*/
function dlaed2( N, n1, d, Q, LDQ, INDXQ, rho, z, DLAMBDA, w, Q2, INDX, INDXC, INDXP, COLTYP ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	return base( N, n1, d, 1, 0, Q, 1, LDQ, 0, INDXQ, 1, 0, rho, z, 1, 0, DLAMBDA, 1, 0, w, 1, 0, Q2, 1, 0, INDX, 1, 0, INDXC, 1, 0, INDXP, 1, 0, COLTYP, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaed2;
