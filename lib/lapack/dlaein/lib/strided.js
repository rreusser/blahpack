/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix.
*
* @param {boolean} rightv - = `true` : compute right eigenvector; = `false`: compute left eigenvector.
* @param {boolean} noinit - = `true` : no initial vector supplied in (VR,VI). = `false`: initial vector supplied in (VR,VI).
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {number} wr - the real and imaginary parts of the eigenvalue of H whose corresponding right or left eigenvector is to be computed.
* @param {number} wi - the real and imaginary parts of the eigenvalue of H whose corresponding right or left eigenvector is to be computed.
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
* @param {number} eps3 - a small machine-dependent value which is used to perturb close eigenvalues, and to replace zero pivots.
* @param {number} smlnum - a machine-dependent value close to the underflow threshold.
* @param {number} bignum - a machine-dependent value close to the overflow threshold.
* @returns {integer} status code (0 = success)
*/
function dlaein( rightv, noinit, N, H, strideH1, strideH2, offsetH, wr, wi, VR, strideVR, offsetVR, VI, strideVI, offsetVI, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork, eps3, smlnum, bignum ) { // eslint-disable-line max-len, max-params
	const minWork = N;
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( rightv, noinit, N, H, strideH1, strideH2, offsetH, wr, wi, VR, strideVR, offsetVR, VI, strideVI, offsetVI, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork, eps3, smlnum, bignum ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaein;
