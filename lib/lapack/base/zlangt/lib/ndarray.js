// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the norm of a complex general tridiagonal matrix A.
*
* The matrix A has sub-diagonal DL, diagonal D, and super-diagonal DU.
*
* @param {string} norm - 'max', 'one-norm', 'inf-norm', or 'frobenius'
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} DL - sub-diagonal elements (length N-1)
* @param {integer} strideDL - stride for DL (in complex elements)
* @param {NonNegativeInteger} offsetDL - starting index for DL (in complex elements)
* @param {Complex128Array} d - diagonal elements (length N)
* @param {integer} strideD - stride for d (in complex elements)
* @param {NonNegativeInteger} offsetD - starting index for d (in complex elements)
* @param {Complex128Array} DU - super-diagonal elements (length N-1)
* @param {integer} strideDU - stride for DU (in complex elements)
* @param {NonNegativeInteger} offsetDU - starting index for DU (in complex elements)
* @throws {TypeError} first argument must be a valid norm value
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} the computed norm
*/
function zlangt( norm, N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU ) { // eslint-disable-line max-len, max-params
	if ( norm !== 'max' && norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm value. Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( norm, N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlangt;
