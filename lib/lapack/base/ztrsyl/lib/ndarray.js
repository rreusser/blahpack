

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves the complex Sylvester matrix equation:.
*
*   op(A)_X + X_op(B) = scale_C  (when isgn = +1)
_   op(A)_X - X_op(B) = scale_C  (when isgn = -1)
*
* where op(A) = A or A**H, and A and B are both upper triangular. A is
* M-by-M and B is N-by-N; the right hand side C and the solution X are
* M-by-N; and scale is an output scale factor, set <= 1 to avoid overflow.
*
* @param {string} trana - `'no-transpose'` or `'conjugate-transpose'` of A
* @param {string} tranb - `'no-transpose'` or `'conjugate-transpose'` of B
* @param {integer} isgn - +1 or -1
* @param {NonNegativeInteger} M - order of matrix A, rows of C
* @param {NonNegativeInteger} N - order of matrix B, columns of C
* @param {Complex128Array} A - upper triangular matrix A (M-by-M)
* @param {integer} strideA1 - stride of first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - upper triangular matrix B (N-by-N)
* @param {integer} strideB1 - stride of first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128Array} C - M-by-N right hand side, overwritten with solution X
* @param {integer} strideC1 - stride of first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @param {Float64Array} scale - output: scale[0] = scaling factor
* @returns {integer} info (0 = success, 1 = perturbed)
*/
function ztrsyl( trana, tranb, isgn, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, scale ) { // eslint-disable-line max-len, max-params
	if ( trana !== 'no-transpose' && trana !== 'conjugate-transpose' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid trana value. Value: `%s`.', trana ) );
	}
	if ( tranb !== 'no-transpose' && tranb !== 'conjugate-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid tranb value. Value: `%s`.', tranb ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( trana, tranb, isgn, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, scale ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztrsyl;
