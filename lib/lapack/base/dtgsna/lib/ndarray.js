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
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a generalized Schur form.
*
* @param {string} job - specifies the operation type
* @param {string} howmny - specifies the operation type
* @param {Float64Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} offsetSELECT - starting index for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
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
* @param {Float64Array} DIF - input array
* @param {integer} strideDIF - stride length for `DIF`
* @param {NonNegativeInteger} offsetDIF - starting index for `DIF`
* @param {integer} mm - mm
* @param {NonNegativeInteger} M - number of rows
* @param {Float64Array} WORK - input array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - output array
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @throws {TypeError} `job` must be one of "eigenvalues", "eigenvectors", or "both"
* @throws {TypeError} `howmny` must be one of "all" or "selected"
* @throws {RangeError} `N` must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dtgsna( job, howmny, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, DIF, strideDIF, offsetDIF, mm, M, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	if ( job !== 'eigenvalues' && job !== 'eigenvectors' && job !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of "eigenvalues", "eigenvectors", or "both". Value: `%s`.', job ) );
	}
	if ( howmny !== 'all' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of "all" or "selected". Value: `%s`.', howmny ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns the workspace; base requires `lwmin` real elements (path-dependent on `job`/`N`). Assert so an undersized buffer is a loud RangeError, not a silent NaN.
	var need;
	if ( N === 0 ) {
		need = 1;
	} else if ( job === 'eigenvectors' || job === 'both' ) {
		need = ( 2 * N * ( N + 2 ) ) + 16;
	} else {
		need = N;
	}
	if ( !WORK || ( WORK.length - offsetWork ) < need ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( job, howmny, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, DIF, strideDIF, offsetDIF, mm, M, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtgsna;
