
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the generalized singular value decomposition (GSVD) of two complex.
* upper triangular (or trapezoidal) matrices A and B.
*
* On entry, it is assumed that matrices A and B have the forms obtained by
* the preprocessing subroutine ZGGSVP.
*
* On exit, U^H_A_Q = D1_(0 R), V^H_B_Q = D2_(0 R), where U, V and Q are
* unitary matrices.
*
* @param {string} jobu - `'compute-vectors'`, `'initialize'`, or `'none'`
* @param {string} jobv - `'compute-vectors'`, `'initialize'`, or `'none'`
* @param {string} jobq - `'compute-vectors'`, `'initialize'`, or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {NonNegativeInteger} K - dimension of the first block
* @param {NonNegativeInteger} l - dimension of the second block
* @param {Complex128Array} A - M-by-N matrix A (overwritten)
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - P-by-N matrix B (overwritten)
* @param {integer} strideB1 - stride of first dimension of B (complex elements)
* @param {integer} strideB2 - stride of second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {number} tola - convergence tolerance for A
* @param {number} tolb - convergence tolerance for B
* @param {Float64Array} ALPHA - output array for generalized singular values (length N)
* @param {integer} strideALPHA - stride for ALPHA
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA
* @param {Float64Array} BETA - output array for generalized singular values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - starting index for BETA
* @param {Complex128Array} U - M-by-M unitary matrix U
* @param {integer} strideU1 - stride of first dimension of U (complex elements)
* @param {integer} strideU2 - stride of second dimension of U (complex elements)
* @param {NonNegativeInteger} offsetU - starting index for U (complex elements)
* @param {Complex128Array} V - P-by-P unitary matrix V
* @param {integer} strideV1 - stride of first dimension of V (complex elements)
* @param {integer} strideV2 - stride of second dimension of V (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (complex elements)
* @param {Complex128Array} Q - N-by-N unitary matrix Q
* @param {integer} strideQ1 - stride of first dimension of Q (complex elements)
* @param {integer} strideQ2 - stride of second dimension of Q (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for Q (complex elements)
* @param {Complex128Array} WORK - workspace array of length 2*N
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {Int32Array} ncycle - output: ncycle[0] receives the number of cycles
* @throws {TypeError} first argument must be a valid jobu value
* @throws {TypeError} second argument must be a valid jobv value
* @throws {TypeError} third argument must be a valid jobq value
* @returns {integer} info - 0 for success, 1 if not converged
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
*
* var A = new Complex128Array( 4 );
* var B = new Complex128Array( 4 );
* var U = new Complex128Array( 4 );
* var V = new Complex128Array( 4 );
* var Q = new Complex128Array( 4 );
* var WORK = new Complex128Array( 4 );
* var ALPHA = new Float64Array( 2 );
* var BETA = new Float64Array( 2 );
* var ncycle = new Int32Array( 1 );
*
* var info = ztgsja( 'initialize', 'initialize', 'initialize', 2, 2, 2, 0, 2, A, 1, 2, 0, B, 1, 2, 0, 1e-14, 1e-14, ALPHA, 1, 0, BETA, 1, 0, U, 1, 2, 0, V, 1, 2, 0, Q, 1, 2, 0, WORK, 1, 0, ncycle );
* // info => 0
*/
function ztgsja( jobu, jobv, jobq, M, p, N, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK, ncycle ) { // eslint-disable-line max-len, max-params
	if ( jobu !== 'none' && jobu !== 'compute-vectors' && jobu !== 'initialize' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid jobu value. Value: `%s`.', jobu ) );
	}
	if ( jobv !== 'none' && jobv !== 'compute-vectors' && jobv !== 'initialize' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid jobv value. Value: `%s`.', jobv ) );
	}
	if ( jobq !== 'none' && jobq !== 'compute-vectors' && jobq !== 'initialize' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid jobq value. Value: `%s`.', jobq ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	return base( jobu, jobv, jobq, M, p, N, K, l, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, tola, tolb, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, U, strideU1, strideU2, offsetU, V, strideV1, strideV2, offsetV, Q, strideQ1, strideQ2, offsetQ, WORK, strideWORK, offsetWORK, ncycle ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsja;
