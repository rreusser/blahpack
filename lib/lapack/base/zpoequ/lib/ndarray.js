

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Computes row and column scalings intended to equilibrate a Hermitian positive
 * definite matrix A and reduce its condition number.
 *
 * S(i) = 1 / sqrt( real(A(i,i)) ). The choice of S puts the condition number
 * of B = S*A*S within a factor N of the smallest possible condition number.
 *
 * Returns an object with:
 * - info: 0 if successful; i (1-based) if the i-th diagonal element is non-positive.
 * - scond: ratio of smallest to largest scaling factor
 * - amax: absolute value of the largest diagonal element
 *
 *
 * @param {NonNegativeInteger} N - order of the matrix A
 * @param {Complex128Array} A - input N-by-N Hermitian positive definite matrix
 * @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
 * @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
 * @param {Float64Array} s - output scale factors, length N
 * @param {integer} strideS - stride for s
 * @param {NonNegativeInteger} offsetS - index offset for s
 * @returns {Object} result with info, scond, amax
 */
function zpoequ( N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, scond, amax ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, scond, amax ); // eslint-disable-line max-len
}


// EXPORTS //

export default zpoequ;
