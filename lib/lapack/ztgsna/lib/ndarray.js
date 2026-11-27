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
import base, { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex generalized Schur form.
*
* @param {('eigenvalues'|'eigenvectors'|'both')} job - one of `'eigenvalues'`, `'eigenvectors'`, `'both'`
* @param {('all'|'selected')} howmny - one of `'all'`, `'selected'`
* @param {Uint8Array} SELECT - boolean selection array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} offsetSELECT - starting index for `SELECT`
* @param {NonNegativeInteger} N - matrix order
* @param {Complex128Array} A - N-by-N input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} B - N-by-N input matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} VL - left eigenvectors
* @param {integer} strideVL1 - stride of the first dimension of `VL`
* @param {integer} strideVL2 - stride of the second dimension of `VL`
* @param {NonNegativeInteger} offsetVL - starting index for `VL`
* @param {Complex128Array} VR - right eigenvectors
* @param {integer} strideVR1 - stride of the first dimension of `VR`
* @param {integer} strideVR2 - stride of the second dimension of `VR`
* @param {NonNegativeInteger} offsetVR - starting index for `VR`
* @param {Float64Array} s - output array for eigenvalue condition numbers
* @param {integer} strideS - stride length for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @param {Float64Array} DIF - output array for eigenvector condition numbers
* @param {integer} strideDIF - stride length for `DIF`
* @param {NonNegativeInteger} offsetDIF - starting index for `DIF`
* @param {NonNegativeInteger} mm - number of columns of VL/VR
* @param {Int32Array} M - input/output (length-1 array): (ignored; returned in result object)
* @param {Complex128Array} WORK - caller-provided complex workspace (contiguous): at least `2*N*N` elements from `offsetWork` when `job` is `'eigenvectors'` or `'both'` and N > 1, else `N`
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - caller-provided integer workspace of at least `N+2` elements when `N > 0` (the reference's declared extent)
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @throws {TypeError} first argument must be one of the following: "both", "eigenvalues", "eigenvectors"
* @throws {TypeError} second argument must be one of the following: "all", "selected"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} N must be nonnegative
* @throws {RangeError} WORK must have at least the reference's minimum, and IWORK at least `N+2` elements, when `N > 0`
* @returns {integer} status code (0 = success)
*/
function ztgsna( job, howmny, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, DIF, strideDIF, offsetDIF, mm, M, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	if ( job !== 'both' && job !== 'eigenvalues' && job !== 'eigenvectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "both", "eigenvalues", "eigenvectors". Value: `%s`.', job ) );
	}
	if ( howmny !== 'all' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "all", "selected". Value: `%s`.', howmny ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// The reference's LWMIN (2N^2 for job 'eigenvectors'/'both', N for 'eigenvalues'), and IWORK's declared dimension N+2 (ztgsyl's M+N+2 with M = N-1, N = 1), on every path though ztgsyl is called only for job 'eigenvectors'/'both', N > 1 (W3; ticket 0107). A zero-dimension problem needs no workspace.
	if ( N > 0 ) {
		const minWork = computeOptimalWorkSize( job, N );
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		const minIWork = N + 2;
		if ( !IWORK || ( IWORK.length - offsetIWork ) < minIWork ) {
			throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', minIWork, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	return base( job, howmny, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, DIF, strideDIF, offsetDIF, mm, M, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsna;
