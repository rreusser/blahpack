

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates the complex unitary matrix Q which is defined as the product.
* of IHI-ILO elementary reflectors of order N, as returned by ZGEHRD:
*
* Q = H(ilo) H(ilo+1) ... H(ihi-1)
*
* ## Notes
*
* -   ILO and IHI are 1-based, matching the Fortran convention.
* -   On entry, A must contain the reflector vectors as returned by ZGEHRD.
* -   On exit, A contains the N-by-N unitary matrix Q.
* -   Q is the identity matrix except in the submatrix
*     Q(ilo:ihi-1, ilo:ihi-1) (0-based).
* -   WORK is allocated internally. The WORK/strideWORK/offsetWORK/lwork
*     parameters are kept for API compatibility.
*
* @param {NonNegativeInteger} N - order of the matrix Q (N >= 0)
* @param {integer} ilo - lower bound from ZGEHRD (1-based)
* @param {integer} ihi - upper bound from ZGEHRD (1-based)
* @param {Complex128Array} A - input/output matrix (N x N)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors from ZGEHRD (length N-1)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace (ignored, allocated internally)
* @param {integer} strideWORK - stride for WORK (ignored)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (ignored)
* @param {integer} lwork - workspace size (ignored)
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zunghr( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zunghr;
