/**
 * Sort an array of doubles in increasing or decreasing order using quicksort.
 * with insertion sort for small partitions.
 *
 *
 * @param {string} id - sort direction: 'increasing' or 'decreasing'
 * @param {NonNegativeInteger} N - number of elements to sort
 * @param {Float64Array} d - array to sort in-place
 * @param {integer} stride - stride length for `d`
 * @param {NonNegativeInteger} offset - starting index for `d`
 * @returns {integer} status code (0 = success)
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Sort an array of doubles in increasing or decreasing order using quicksort.
*
* @param {string} id - sort direction: 'increasing' or 'decreasing'
* @param {NonNegativeInteger} N - number of elements to sort
* @param {Float64Array} d - array to sort in-place
* @param {integer} stride - stride length for `d`
* @param {NonNegativeInteger} offset - starting index for `d`
* @throws {TypeError} first argument must be a valid sort order
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dlasrt( id, N, d, stride, offset ) {
	if ( id !== 'increasing' && id !== 'decreasing' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid sort order. Value: `%s`.', id ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( id, N, d, stride, offset );
}


// EXPORTS //

export default dlasrt;
