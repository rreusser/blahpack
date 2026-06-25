
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the generalized singular value decomposition (GSVD) of an M-by-N.
* real matrix A and P-by-N real matrix B:
*
*   U^T_A_Q = D1_(0 R),    V^T_B_Q = D2_(0 R)
*
* where U, V and Q are orthogonal matrices.
*
* @param {string} jobu - `'compute-U'` or `'none'`
* @param {string} jobv - `'compute-V'` or `'none'`
* @param {string} jobq - `'compute-Q'` or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {NonNegativeInteger} p - number of rows of B
* @param {Int32Array} K - output: K[0] receives first dimension of subblocks
* @param {Int32Array} l - output: l[0] receives second dimension of subblocks
* @param {Float64Array} A - M-by-N matrix A (overwritten with triangular R)
* @param {integer} strideA1 - stride of first dimension of A
* @param {integer} strideA2 - stride of second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - P-by-N matrix B (overwritten)
* @param {integer} strideB1 - stride of first dimension of B
* @param {integer} strideB2 - stride of second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} ALPHA - output array for alpha values (length N)
* @param {integer} strideALPHA - stride for ALPHA
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA
* @param {Float64Array} BETA - output array for beta values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - starting index for BETA
* @param {Float64Array} U - M-by-M orthogonal matrix U
* @param {integer} strideU1 - stride of first dimension of U
* @param {integer} strideU2 - stride of second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Float64Array} V - P-by-P orthogonal matrix V
* @param {integer} strideV1 - stride of first dimension of V
* @param {integer} strideV2 - stride of second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} Q - N-by-N orthogonal matrix Q
* @param {integer} strideQ1 - stride of first dimension of Q
* @param {integer} strideQ2 - stride of second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Float64Array} WORK - workspace array of length at least max(1, lwork)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - workspace size; -1 for workspace query
* @param {Int32Array} IWORK - integer workspace of length N
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @returns {integer} info - 0 for success, 1 if Jacobi procedure failed to converge
*/
function dggsvd3( jobu, jobv, jobq, M, N, p, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK ) { // eslint-disable-line max-len, max-params
	if ( jobu !== 'compute-U' && jobu !== 'none' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid jobu value. Value: `%s`.', jobu ) );
	}
	if ( jobv !== 'compute-V' && jobv !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid jobv value. Value: `%s`.', jobv ) );
	}
	if ( jobq !== 'compute-Q' && jobq !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid jobq value. Value: `%s`.', jobq ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	var minWork = Math.max( 1, 2 * N );
	if ( !WORK || ( WORK.length - offsetWORK ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWORK, WORK ? WORK.length : 0 ) );
	}
	return base( jobu, jobv, jobq, M, N, p, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dggsvd3;
