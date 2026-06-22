
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a generalized QR factorization of an N-by-M matrix A and an N-by-P matrix B.
*
* @param {NonNegativeInteger} N - number of rows of A and B
* @param {NonNegativeInteger} M - number of columns of A
* @param {NonNegativeInteger} p - number of columns of B
* @param {Complex128Array} A - N-by-M matrix (overwritten with R and reflectors)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} TAUA - output: scalar factors of reflectors for Q
* @param {integer} strideTAUA - stride for `TAUA`
* @param {NonNegativeInteger} offsetTAUA - offset for `TAUA`
* @param {Complex128Array} B - N-by-P matrix (overwritten with T and reflectors)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} TAUB - output: scalar factors of reflectors for Z
* @param {integer} strideTAUB - stride for `TAUB`
* @param {NonNegativeInteger} offsetTAUB - offset for `TAUB`
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWORK - stride for `WORK`
* @param {NonNegativeInteger} offsetWORK - offset for `WORK`
* @param {integer} lwork - length of workspace
* @returns {integer} info - 0 on success
*/
function zggqrf( N, M, p, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	return base( N, M, p, A, strideA1, strideA2, offsetA, TAUA, strideTAUA, offsetTAUA, B, strideB1, strideB2, offsetB, TAUB, strideTAUB, offsetTAUB, WORK, strideWORK, offsetWORK, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zggqrf;
