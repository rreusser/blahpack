
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the norm of a real general tridiagonal matrix A.
*
* The matrix A has sub-diagonal DL, diagonal D, and super-diagonal DU.
*
* @param {string} norm - 'max', 'one-norm', 'inf-norm', or 'frobenius'
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} DL - sub-diagonal elements (length N-1)
* @param {integer} strideDL - stride for DL
* @param {NonNegativeInteger} offsetDL - starting index for DL
* @param {Float64Array} d - diagonal elements (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} DU - super-diagonal elements (length N-1)
* @param {integer} strideDU - stride for DU
* @param {NonNegativeInteger} offsetDU - starting index for DU
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} the computed norm
*/
function dlangt( norm, N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU ) { // eslint-disable-line max-len, max-params
	if ( norm !== 'max' && norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm value. Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( norm, N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlangt;
