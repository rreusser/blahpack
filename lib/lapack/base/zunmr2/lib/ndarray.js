

// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
 * Overwrites the M-by-N matrix C with Q*C, Q^H*C, C*Q, or C*Q^H,
 * where Q is a complex unitary matrix defined as the product of K
 * elementary reflectors from an RQ factorization:
 *
 *   Q = H(1)^H * H(2)^H * ... * H(k)^H
 *
 * as returned by ZGERQF. Each H(i) has the form H(i) = I - tau * v * v^H.
 *
 * The reflectors are stored in ROWS of A. For reflector i (0-based),
 * the vector v occupies A(i, 0:NQ-K+i) with A(i, NQ-K+i) = 1.
 *
 * A, TAU, C, WORK are Complex128Arrays. Strides and offsets are in complex elements.
 *
 *
 * @param {string} side - 'left' to apply Q from left, 'right' from right
 * @param {string} trans - 'no-transpose' for Q, 'conjugate-transpose' for Q^H
 * @param {NonNegativeInteger} M - number of rows of C
 * @param {NonNegativeInteger} N - number of columns of C
 * @param {NonNegativeInteger} K - number of elementary reflectors
 * @param {Complex128Array} A - reflector vectors from ZGERQF (K-by-NQ)
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Complex128Array} TAU - scalar factors of reflectors
 * @param {integer} strideTAU - stride for TAU (complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
 * @param {Complex128Array} C - input/output matrix
 * @param {integer} strideC1 - stride of the first dimension of C (complex elements)
 * @param {integer} strideC2 - stride of the second dimension of C (complex elements)
 * @param {NonNegativeInteger} offsetC - starting index for C (complex elements)
 * @param {Complex128Array} WORK - workspace
 * @param {integer} strideWORK - stride for WORK (complex elements)
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
 * @throws {TypeError} First argument must be a valid operation side
 * @throws {TypeError} Second argument must be a valid transpose operation
 * @returns {integer} info - 0 if successful
 */
function zunmr2( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	return base( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zunmr2;
