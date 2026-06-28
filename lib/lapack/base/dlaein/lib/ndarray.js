
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix.
*
* @param {boolean} rightv - rightv
* @param {boolean} noinit - noinit
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {number} wr - wr
* @param {number} wi - wi
* @param {Float64Array} VR - input array
* @param {integer} strideVR - stride length for `VR`
* @param {NonNegativeInteger} offsetVR - starting index for `VR`
* @param {Float64Array} VI - input array
* @param {integer} strideVI - stride length for `VI`
* @param {NonNegativeInteger} offsetVI - starting index for `VI`
* @param {Float64Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} WORK - output array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {number} eps3 - eps3
* @param {number} smlnum - smlnum
* @param {number} bignum - bignum
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dlaein( rightv, noinit, N, H, strideH1, strideH2, offsetH, wr, wi, VR, strideVR, offsetVR, VI, strideVI, offsetVI, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork, eps3, smlnum, bignum ) { // eslint-disable-line max-len, max-params
	var minWork = N;
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( rightv, noinit, N, H, strideH1, strideH2, offsetH, wr, wi, VR, strideVR, offsetVR, VI, strideVI, offsetVI, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork, eps3, smlnum, bignum ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaein;
