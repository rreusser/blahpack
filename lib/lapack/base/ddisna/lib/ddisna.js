

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute the reciprocal condition numbers for the eigenvectors of a real symmetric or complex Hermitian matrix
*
* @param {string} job - specifies the operation type
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} SEP - output array
* @param {integer} strideSEP - stride length for `SEP`
* @returns {integer} status code (0 = success)
*/
function ddisna( job, M, N, d, strideD, SEP, strideSEP ) { // eslint-disable-line max-len, max-params
	var od = stride2offset( N, strideD );
	var oSEP = stride2offset( N, strideSEP );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( job, M, N, d, strideD, od, SEP, strideSEP, oSEP ); // eslint-disable-line max-len
}


// EXPORTS //

export default ddisna;
