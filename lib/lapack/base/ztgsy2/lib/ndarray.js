
// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves the generalized Sylvester matrix equation for small subsystems.
*
* @param {string} trans - specifies the operation type
* @param {integer} ijob - ijob
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} C - input matrix
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Float64Array} D - input matrix
* @param {integer} strideD1 - stride of the first dimension of `D`
* @param {integer} strideD2 - stride of the second dimension of `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @param {Float64Array} E - input matrix
* @param {integer} strideE1 - stride of the first dimension of `E`
* @param {integer} strideE2 - stride of the second dimension of `E`
* @param {NonNegativeInteger} offsetE - starting index for `E`
* @param {Float64Array} F - output matrix
* @param {integer} strideF1 - stride of the first dimension of `F`
* @param {integer} strideF2 - stride of the second dimension of `F`
* @param {NonNegativeInteger} offsetF - starting index for `F`
* @param {number} scale - scale
* @param {number} rdsum - rdsum
* @param {number} rdscal - rdscal
* @throws {TypeError} First argument must be a valid transpose operation
* @returns {integer} status code (0 = success)
*/
function ztgsy2( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, rdsum, rdscal ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, rdsum, rdscal ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsy2;
