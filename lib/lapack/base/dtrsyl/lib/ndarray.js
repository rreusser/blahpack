
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves the real Sylvester matrix equation:.
*
*   op(A) _ X + ISGN _ X _ op(B) = scale _ C
*
* where op(A) = A or A**T, A and B are upper quasi-triangular, and
* scale is an output scale factor set <= 1 to avoid overflow in X.
*
* @param {string} trana - `'no-transpose'` or `'transpose'` of A
* @param {string} tranb - `'no-transpose'` or `'transpose'` of B
* @param {integer} isgn - +1 or -1
* @param {NonNegativeInteger} M - number of rows in A and C
* @param {NonNegativeInteger} N - number of columns in B and C
* @param {Float64Array} A - M-by-M upper quasi-triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - N-by-N upper quasi-triangular matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} C - M-by-N right-hand side, overwritten with solution X
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} scale - output: scale[0] is the scaling factor
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info (0 = success, 1 = A and B have common or close eigenvalues)
*/
function dtrsyl( trana, tranb, isgn, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, scale ) { // eslint-disable-line max-len, max-params
	if ( trana !== 'no-transpose' && trana !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid trana value. Value: `%s`.', trana ) );
	}
	if ( tranb !== 'no-transpose' && tranb !== 'transpose' ) {
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

export default dtrsyl;
