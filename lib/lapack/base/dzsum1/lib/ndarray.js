
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Takes the sum of the absolute values of a complex vector and returns a.
* double precision result.
*
* Based on DZASUM from Level 1 BLAS. The change is to use the 'genuine'
* absolute value (cabs) rather than dcabs1.
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} CX - complex input vector
* @param {integer} strideCX - stride for `CX` (in complex elements)
* @param {NonNegativeInteger} offsetCX - starting index for `CX` (in complex elements)
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} sum of absolute values
*/
function dzsum1( N, CX, strideCX, offsetCX ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, CX, strideCX, offsetCX );
}


// EXPORTS //

export default dzsum1;
