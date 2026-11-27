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
* Uses inverse iteration to find right and/or left eigenvectors of a complex upper Hessenberg matrix.
*
* @param {('left'|'right'|'both')} side - specifies the operation type
* @param {('qr'|'no-source')} eigsrc - specifies the operation type
* @param {('no-init'|'user')} initv - specifies the operation type
* @param {Uint8Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} offsetSELECT - starting index for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} H - input matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Complex128Array} w - input array
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Complex128Array} VL - input matrix
* @param {integer} strideVL1 - stride of the first dimension of `VL`
* @param {integer} strideVL2 - stride of the second dimension of `VL`
* @param {NonNegativeInteger} offsetVL - starting index for `VL`
* @param {Complex128Array} VR - input matrix
* @param {integer} strideVR1 - stride of the first dimension of `VR`
* @param {integer} strideVR2 - stride of the second dimension of `VR`
* @param {NonNegativeInteger} offsetVR - starting index for `VR`
* @param {NonNegativeInteger} mm - the number of columns in the arrays VL and/or VR.
* @param {Int32Array} M - input/output (length-1 array): number of rows
* @param {Complex128Array} WORK - input array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Float64Array} RWORK - input array
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @param {Int32Array} IFAILL - input array
* @param {integer} strideIFAILL - stride length for `IFAILL`
* @param {NonNegativeInteger} offsetIFAILL - starting index for `IFAILL`
* @param {Int32Array} IFAILR - output array
* @param {integer} strideIFAILR - stride length for `IFAILR`
* @param {NonNegativeInteger} offsetIFAILR - starting index for `IFAILR`
* @throws {TypeError} first argument must be one of the following: "both", "left", "right"
* @throws {TypeError} second argument must be one of the following: "no-source", "qr"
* @throws {TypeError} third argument must be one of the following: "no-init", "user"
* @throws {RangeError} seventh argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function zhsein( side, eigsrc, initv, SELECT, strideSELECT, offsetSELECT, N, H, strideH1, strideH2, offsetH, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IFAILL, strideIFAILL, offsetIFAILL, IFAILR, strideIFAILR, offsetIFAILR ) { // eslint-disable-line max-len, max-params
	let needR, need;

	if ( side !== 'both' && side !== 'left' && side !== 'right' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "both", "left", "right". Value: `%s`.', side ) );
	}
	if ( eigsrc !== 'no-source' && eigsrc !== 'qr' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-source", "qr". Value: `%s`.', eigsrc ) );
	}
	if ( initv !== 'no-init' && initv !== 'user' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-init", "user". Value: `%s`.', initv ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}

	// Caller owns the workspace; assert WORK (>= N*N complex elements) and RWORK (>= N) are large enough so an undersized buffer is a loud RangeError, not a silent NaN. N===0 is a quick return that needs no workspace.
	if ( N > 0 ) {
		need = N * N;
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
		needR = N;
		if ( !RWORK || ( RWORK.length - offsetRWork ) < needR ) {
			throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', needR, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	return base( side, eigsrc, initv, SELECT, strideSELECT, offsetSELECT, N, H, strideH1, strideH2, offsetH, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IFAILL, strideIFAILL, offsetIFAILL, IFAILR, strideIFAILR, offsetIFAILR ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhsein;
