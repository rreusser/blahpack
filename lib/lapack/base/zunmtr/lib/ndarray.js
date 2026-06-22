

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Overwrites the M-by-N matrix C with Q*C, Q^H*C, C*Q, or C*Q^H,
 * where Q is a complex unitary matrix defined from the output of ZHETRD.
 *
 * If UPLO='upper', Q is defined as Q = H(NQ-1)*...*H(2)*H(1) (QL factorization).
 * If UPLO='lower', Q is defined as Q = H(1)*H(2)*...*H(NQ-1) (QR factorization).
 *
 * NQ = M if SIDE='left', NQ = N if SIDE='right'.
 *
 *
 * @param {string} side - 'left' or 'right'
 * @param {string} uplo - 'upper' or 'lower'
 * @param {string} trans - 'no-transpose' or 'conjugate-transpose'
 * @param {NonNegativeInteger} M - number of rows of C
 * @param {NonNegativeInteger} N - number of columns of C
 * @param {Complex128Array} A - output of zhetrd (reflector storage)
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Complex128Array} TAU - scalar factors from zhetrd
 * @param {integer} strideTAU - stride for TAU (complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
 * @param {Complex128Array} C - input/output matrix
 * @param {integer} strideC1 - stride of the first dimension of C (complex elements)
 * @param {integer} strideC2 - stride of the second dimension of C (complex elements)
 * @param {NonNegativeInteger} offsetC - starting index for C (complex elements)
 * @param {Complex128Array} WORK - workspace
 * @param {integer} strideWORK - stride for WORK (complex elements)
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
 * @param {integer} lwork - length of WORK
 * @throws {TypeError} First argument must be a valid operation side
 * @throws {TypeError} Second argument must be a valid matrix triangle
 * @throws {TypeError} Third argument must be a valid transpose operation
 * @returns {integer} info - 0 if successful
 */
function zunmtr( side, uplo, trans, M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( side, uplo, trans, M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zunmtr;
