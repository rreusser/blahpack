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
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex generalized Schur form.
*
* @param {string} job - one of `'eigenvalues'`, `'eigenvectors'`, `'both'`
* @param {string} howmny - one of `'all'`, `'selected'`
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
* @param {integer} mm - number of columns of VL/VR
* @param {NonNegativeInteger} M - (ignored; returned in result object)
* @param {Complex128Array} WORK - caller-provided complex workspace (contiguous)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - caller-provided integer workspace
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @throws {TypeError} first argument must be one of `eigenvalues`, `eigenvectors`, `both`
* @throws {TypeError} second argument must be one of `all`, `selected`
* @throws {RangeError} N must be nonnegative
* @throws {RangeError} WORK/IWORK must be sufficiently large for the eigenvector-condition path
* @returns {Object} result object with fields `info` and `m`
*/
function ztgsna( job, howmny, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, DIF, strideDIF, offsetDIF, mm, M, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	if ( job !== 'eigenvalues' && job !== 'eigenvectors' && job !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of `eigenvalues`, `eigenvectors`, `both`. Value: `%s`.', job ) );
	}
	if ( howmny !== 'all' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of `all`, `selected`. Value: `%s`.', howmny ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Assert caller-provided workspace is large enough. The eigenvector-condition
	// (DIF) path copies A and B (each N*N) and runs ztgsyl scratch; the
	// eigenvalue path uses an N-length vector.
	const wants = ( job === 'eigenvalues' || job === 'both' );
	const wantdf = ( job === 'eigenvectors' || job === 'both' );
	if ( N > 0 ) {
		let minWork;
		if ( wantdf && N > 1 ) {
			minWork = ( 2 * N * N ) + Math.max( 1, 4 * ( N - 1 ) );
		} else if ( wants ) {
			minWork = N;
		} else {
			minWork = 0;
		}
		if ( minWork > 0 && ( !WORK || ( WORK.length - offsetWork ) < minWork ) ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		if ( wantdf && N > 1 ) {
			const minIWork = N + 6;
			if ( !IWORK || ( IWORK.length - offsetIWork ) < minIWork ) {
				throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', minIWork, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
			}
		}
	}
	return base( job, howmny, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, DIF, strideDIF, offsetDIF, mm, M, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsna;
