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
* Estimates reciprocal condition numbers of eigenvalues and/or eigenvectors of a real upper quasi-triangular matrix.
*
* @param {string} job - specifies the operation type
* @param {string} howmny - specifies the operation type
* @param {Float64Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} offsetSELECT - starting index for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} T - input matrix
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Float64Array} VL - input matrix
* @param {integer} strideVL1 - stride of the first dimension of `VL`
* @param {integer} strideVL2 - stride of the second dimension of `VL`
* @param {NonNegativeInteger} offsetVL - starting index for `VL`
* @param {Float64Array} VR - input matrix
* @param {integer} strideVR1 - stride of the first dimension of `VR`
* @param {integer} strideVR2 - stride of the second dimension of `VR`
* @param {NonNegativeInteger} offsetVR - starting index for `VR`
* @param {Float64Array} s - input array
* @param {integer} strideS - stride length for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @param {Float64Array} SEP - input array
* @param {integer} strideSEP - stride length for `SEP`
* @param {NonNegativeInteger} offsetSEP - starting index for `SEP`
* @param {integer} mm - mm
* @param {NonNegativeInteger} M - number of rows
* @param {Float64Array} WORK - input matrix
* @param {integer} strideWork1 - stride of the first dimension of `WORK`
* @param {integer} strideWork2 - stride of the second dimension of `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - output array
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @returns {integer} status code (0 = success)
*/
function dtrsna( job, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, SEP, strideSEP, offsetSEP, mm, WORK, strideWork1, strideWork2, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	if ( job !== 'eigenvalues' && job !== 'eigenvectors' && job !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job. Value: `%s`.', job ) );
	}
	if ( howmny !== 'all' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid howmny. Value: `%s`.', howmny ) );
	}
	// Caller owns the workspace; assert the arrays are sufficiently large so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN
	// from an out-of-bounds read. WORK/IWORK are only referenced when the
	// eigenvector condition numbers are requested (job 'eigenvectors'/'both'):
	// WORK is a logical (>=N)-by-(N+6) array (N*(N+6) elements) and IWORK holds
	// 2*(N-1) ints. When only eigenvalue condition numbers are wanted, no
	// workspace is needed.
	if ( ( job === 'eigenvectors' || job === 'both' ) && N > 0 ) {
		if ( !WORK || ( WORK.length - offsetWork ) < ( N * ( N+6 ) ) ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', N * ( N+6 ), offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		if ( !IWORK || ( IWORK.length - offsetIWork ) < ( 2 * ( N-1 ) ) ) {
			throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', 2 * ( N-1 ), offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
		}
	}
	return base( job, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, SEP, strideSEP, offsetSEP, mm, WORK, strideWork1, strideWork2, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrsna;
