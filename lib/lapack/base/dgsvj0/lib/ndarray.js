

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Pre-processor for dgesvj performing Jacobi rotations.
*
* @param {number} jobv - jobv
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} sva - input array
* @param {integer} strideSVA - stride length for `sva`
* @param {NonNegativeInteger} offsetSVA - starting index for `sva`
* @param {integer} mv - mv
* @param {Float64Array} V - output matrix
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {number} eps - eps
* @param {number} sfmin - sfmin
* @param {number} tol - tol
* @param {integer} nsweep - nsweep
* @param {Float64Array} work - input array
* @param {integer} strideWORK - stride length for `work`
* @param {NonNegativeInteger} offsetWORK - starting index for `work`
* @param {integer} lwork - lwork
* @throws {TypeError} first argument must be a valid `jobv` value
* @returns {integer} status code (0 = success)
*/
function dgsvj0( jobv, M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
	if ( jobv !== 'compute-v' && jobv !== 'apply-v' && jobv !== 'no-v' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `jobv` value. Value: `%s`.', jobv ) );
	}
	return base( jobv, M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWORK, offsetWORK, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgsvj0;
