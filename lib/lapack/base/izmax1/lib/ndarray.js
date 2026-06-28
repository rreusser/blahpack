
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Finds the index of the first vector element of maximum absolute value.
*
* Based on IZAMAX from Level 1 BLAS. The change is to use the 'genuine'
* absolute value (cabs) rather than dcabs1.
*
* Returns a 0-based index (Fortran returns 1-based).
*
* @param {NonNegativeInteger} N - number of complex elements
* @param {Complex128Array} ZX - complex input vector
* @param {integer} strideZX - stride for `ZX` (in complex elements)
* @param {NonNegativeInteger} offsetZX - starting index for `ZX` (in complex elements)
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} 0-based index of the element with maximum absolute value
*/
function izmax1( N, ZX, strideZX, offsetZX ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, ZX, strideZX, offsetZX );
}


// EXPORTS //

export default izmax1;
