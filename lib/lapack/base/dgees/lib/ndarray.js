
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes for an N-by-N real nonsymmetric matrix A, the eigenvalues, the real.
* Schur form T, and, optionally, the matrix of Schur vectors Z. This gives
* the Schur factorization A = Z_T_Z**T.
*
* Optionally, it also orders the eigenvalues on the diagonal of the real Schur
* form so that selected eigenvalues are at the top left. The leading columns
* of Z then form an orthonormal basis for the invariant subspace corresponding
* to the selected eigenvalues.
*
* @param {string} jobvs - `'none'` or `'compute-vectors'`
* @param {string} sort - `'none'` or `'sort'`
* @param {Function} select - function(wr, wi) returning boolean; used when sort=`'sort'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - N-by-N matrix, overwritten with Schur form T on exit
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} sdim - output: sdim[0] = number of eigenvalues for which SELECT is true
* @param {Float64Array} WR - output: real parts of eigenvalues
* @param {integer} strideWR - stride for WR
* @param {NonNegativeInteger} offsetWR - starting index for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues
* @param {integer} strideWI - stride for WI
* @param {NonNegativeInteger} offsetWI - starting index for WI
* @param {Float64Array} VS - output: N-by-N matrix of Schur vectors
* @param {integer} strideVS1 - stride of the first dimension of VS
* @param {integer} strideVS2 - stride of the second dimension of VS
* @param {NonNegativeInteger} offsetVS - starting index for VS
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - length of WORK
* @param {Uint8Array} BWORK - boolean workspace of length N (used when sort=`'sort'`)
* @param {integer} strideBWORK - stride for BWORK
* @param {NonNegativeInteger} offsetBWORK - starting index for BWORK
* @returns {integer} info (0=success, >0 eigenvalue computation failed, N+1/N+2 sorting issues)
*/
function dgees( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VS, strideVS1, strideVS2, offsetVS, WORK, strideWORK, offsetWORK, lwork, BWORK, strideBWORK, offsetBWORK ) { // eslint-disable-line max-len, max-params
	if ( jobvs !== 'no-vectors' && jobvs !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid jobvs value. Value: `%s`.', jobvs ) );
	}
	if ( sort !== 'none' && sort !== 'sort' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid sort value. Value: `%s`.', sort ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VS, strideVS1, strideVS2, offsetVS, WORK, strideWORK, offsetWORK, lwork, BWORK, strideBWORK, offsetBWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgees;
