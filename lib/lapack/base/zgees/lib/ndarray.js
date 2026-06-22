
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes for an N-by-N complex nonsymmetric matrix A, the eigenvalues.
* the Schur form T, and, optionally, the matrix of Schur vectors Z.
* This gives the Schur factorization A = Z_T_(Z**H).
*
* Optionally, it also orders the eigenvalues on the diagonal of the Schur
* form so that selected eigenvalues are at the top left. The leading columns
* of Z then form an orthonormal basis for the invariant subspace corresponding
* to the selected eigenvalues.
*
* A complex matrix is in Schur form if it is upper triangular.
*
* @param {string} jobvs - `'none'` or `'compute-vectors'`
* @param {string} sort - `'none'` or `'sort'`
* @param {Function} select - function(W) returning boolean, where W is Complex128; used when sort=`'sort'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - N-by-N matrix, overwritten with Schur form T on exit
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Float64Array} sdim - output: sdim[0] = number of eigenvalues for which SELECT is true
* @param {Complex128Array} W - output: eigenvalues
* @param {integer} strideW - stride for W (complex elements)
* @param {NonNegativeInteger} offsetW - starting index for W (complex elements)
* @param {Complex128Array} VS - output: N-by-N matrix of Schur vectors (if jobvs=`'compute-vectors'`)
* @param {integer} strideVS1 - stride of first dimension of VS (complex elements)
* @param {integer} strideVS2 - stride of second dimension of VS (complex elements)
* @param {NonNegativeInteger} offsetVS - starting index for VS (complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {integer} lwork - workspace length (complex elements)
* @param {Float64Array} RWORK - real workspace of length N
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @param {Uint8Array} BWORK - boolean workspace of length N (used when sort=`'sort'`)
* @param {integer} strideBWORK - stride for BWORK
* @param {NonNegativeInteger} offsetBWORK - starting index for BWORK
* @returns {integer} info (0=success, >0 = failure)
*/
function zgees( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, W, strideW, offsetW, VS, strideVS1, strideVS2, offsetVS, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, BWORK, strideBWORK, offsetBWORK ) { // eslint-disable-line max-len, max-params
	if ( jobvs !== 'no-vectors' && jobvs !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid jobvs value. Value: `%s`.', jobvs ) );
	}
	if ( sort !== 'sort' && sort !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid sort value. Value: `%s`.', sort ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, W, strideW, offsetW, VS, strideVS1, strideVS2, offsetVS, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK, BWORK, strideBWORK, offsetBWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgees;
