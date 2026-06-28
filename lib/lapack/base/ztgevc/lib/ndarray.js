/**
 * ABS1: |re| + |im| (cheap complex absolute value).
 *
 *
 * @param {Float64Array} arr - interleaved complex array
 * @param {integer} idx - index of real part
 * @throws {TypeError} First argument must be a valid operation side
 * @returns {number} |re| + |im|
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute some or all of the right and/or left eigenvectors of a pair of.
*
* @param {string} side - `'right'`, `'left'`, or `'both'`
* @param {string} howmny - `'all'`, `'backtransform'`, or `'selected'`
* @param {BooleanArray} SELECT - logical array of length N (used when howmny=`'selected'`)
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - offset for SELECT
* @param {NonNegativeInteger} N - order of matrices
* @param {Complex128Array} S - upper triangular matrix
* @param {integer} strideS1 - first dim stride of S (complex elements)
* @param {integer} strideS2 - second dim stride of S (complex elements)
* @param {NonNegativeInteger} offsetS - starting index for S (complex elements)
* @param {Complex128Array} P - upper triangular matrix with real diagonal
* @param {integer} strideP1 - first dim stride of P (complex elements)
* @param {integer} strideP2 - second dim stride of P (complex elements)
* @param {NonNegativeInteger} offsetP - starting index for P (complex elements)
* @param {Complex128Array} VL - left eigenvectors (modified in-place)
* @param {integer} strideVL1 - first dim stride of VL (complex elements)
* @param {integer} strideVL2 - second dim stride of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - starting index for VL (complex elements)
* @param {Complex128Array} VR - right eigenvectors (modified in-place)
* @param {integer} strideVR1 - first dim stride of VR (complex elements)
* @param {integer} strideVR2 - second dim stride of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - starting index for VR (complex elements)
* @param {NonNegativeInteger} mm - number of columns in VL/VR
* @param {Array<integer>} M - output: number of eigenvectors computed (M[0])
* @param {Complex128Array} WORK - workspace (length >= 2*N)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace (length >= 2*N)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - offset for RWORK
* @throws {TypeError} first argument must be a valid operation side
* @throws {TypeError} second argument must be a valid selection type
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} 24th argument must be a nonnegative integer
* @returns {integer} 0 on success
*/
function ztgevc( side, howmny, SELECT, strideSELECT, offsetSELECT, N, S, strideS1, strideS2, offsetS, P, strideP1, strideP2, offsetP, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	if ( side !== 'left' && side !== 'right' && side !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( howmny !== 'all' && howmny !== 'backtransform' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid selection type. Value: `%s`.', howmny ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. 24th argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( side, howmny, SELECT, strideSELECT, offsetSELECT, N, S, strideS1, strideS2, offsetS, P, strideP1, strideP2, offsetP, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );
}


// EXPORTS //

export default ztgevc;
