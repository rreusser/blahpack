
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the splitting points with threshold based on the representation.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of the tridiagonal matrix, length N
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements (in/out), length N
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} E2 - squares of subdiagonal elements (in/out), length N
* @param {integer} strideE2 - stride length for `E2`
* @param {NonNegativeInteger} offsetE2 - starting index for `E2`
* @param {number} spltol - splitting threshold
* @param {number} tnrm - norm of the matrix
* @param {Int32Array} nsplit - output: number of blocks (nsplit[0])
* @param {Int32Array} ISPLIT - output: splitting points array
* @param {integer} strideISPLIT - stride length for `ISPLIT`
* @param {NonNegativeInteger} offsetISPLIT - starting index for `ISPLIT`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - status code (0 = success)
*/
function dlarra( N, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, spltol, tnrm, nsplit, ISPLIT, strideISPLIT, offsetISPLIT ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, spltol, tnrm, nsplit, ISPLIT, strideISPLIT, offsetISPLIT ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarra;
