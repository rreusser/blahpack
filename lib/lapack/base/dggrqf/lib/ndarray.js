
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a generalized RQ factorization of an M-by-N matrix A and a.
* P-by-N matrix B:
*
* ```text
* A = R*Q,        B = Z*T*Q,
* ```
*
* where Q is an N-by-N orthogonal matrix, Z is a P-by-P orthogonal matrix,
* and R and T are upper trapezoidal/triangular.
*
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {Float64Array} A - M-by-N matrix (overwritten with R and reflectors)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAUA - output: scalar factors of reflectors for Q
* @param {integer} strideTAUA - stride for TAUA
* @param {NonNegativeInteger} offsetTAUA - offset for TAUA
* @param {Float64Array} B - P-by-N matrix (overwritten with T and reflectors)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} TAUB - output: scalar factors of reflectors for Z
* @param {integer} strideTAUB - stride for TAUB
* @param {NonNegativeInteger} offsetTAUB - offset for TAUB
* @returns {integer} info - 0 on success
*/
function dggrqf( M, p, N, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( M, p, N, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB ); // eslint-disable-line max-len
}


// EXPORTS //

export default dggrqf;
