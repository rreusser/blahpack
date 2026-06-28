
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} CX - CX
* @param {integer} strideCX - strideCX
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Float64Array} output array
*/
function dzsum1( N, CX, strideCX ) {
	var ocx;

	ocx = stride2offset( N, strideCX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, CX, strideCX, ocx );
}


// EXPORTS //

export default dzsum1;
