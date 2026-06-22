// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves the generalized Sylvester equation using a level-3 blocked algorithm.
*
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {integer} ijob - job selector (0-4)
* @param {PositiveInteger} M - number of rows
* @param {PositiveInteger} N - number of columns
* @param {Complex128Array} A - M-by-M upper triangular matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} B - N-by-N upper triangular matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} C - M-by-N right-hand side / solution
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Complex128Array} D - M-by-M upper triangular matrix
* @param {integer} strideD1 - stride of the first dimension of `D`
* @param {integer} strideD2 - stride of the second dimension of `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @param {Complex128Array} E - N-by-N upper triangular matrix
* @param {integer} strideE1 - stride of the first dimension of `E`
* @param {integer} strideE2 - stride of the second dimension of `E`
* @param {NonNegativeInteger} offsetE - starting index for `E`
* @param {Complex128Array} F - M-by-N right-hand side / solution
* @param {integer} strideF1 - stride of the first dimension of `F`
* @param {integer} strideF2 - stride of the second dimension of `F`
* @param {NonNegativeInteger} offsetF - starting index for `F`
* @param {Float64Array} scale - output: scale[0]
* @param {Float64Array} dif - output: dif[0] (for ijob >= 1)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {integer} lwork - workspace size
* @param {Int32Array} IWORK - workspace of length M+N+6
* @param {integer} strideIWORK - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
* @throws {TypeError} First argument must be a valid transpose operation
* @returns {integer} info - 0 if successful
*/
function ztgsyl( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, dif, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, dif, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsyl;
