/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Merges eigenvalues and deflates the secular equation in divide and conquer.
*
* @private
* @param {string} order - storage layout ('row-major' or 'column-major')
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
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} result with `info`, `K`, and `rho`
*/
function dlaed2( order, N, n1, d, Q, LDQ, INDXQ, rho, z, DLAMBDA, w, Q2, INDX, INDXC, INDXP, COLTYP ) { // eslint-disable-line max-len, max-params
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sq1 = ( order === 'column-major' ) ? 1 : LDQ;
	const sq2 = ( order === 'column-major' ) ? LDQ : 1;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	if ( order === 'column-major' && LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	return base( N, n1, d, 1, 0, Q, sq1, sq2, 0, INDXQ, 1, 0, rho, z, 1, 0, DLAMBDA, 1, 0, w, 1, 0, Q2, 1, 0, INDX, 1, 0, INDXC, 1, 0, INDXP, 1, 0, COLTYP, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaed2;
