/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex triangular matrix.
*
* @param {string} job - `'eigenvalues'`, `'eigenvectors'`, or `'both'`
* @param {string} howmny - `'all'` or `'selected'`
* @param {(Uint8Array|Array)} SELECT - boolean selection array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} offsetSELECT - starting index for `SELECT`
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Complex128Array} T - input upper triangular matrix
* @param {integer} strideT1 - stride of first dimension of `T`
* @param {integer} strideT2 - stride of second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Complex128Array} VL - left eigenvector matrix
* @param {integer} strideVL1 - stride of first dimension of `VL`
* @param {integer} strideVL2 - stride of second dimension of `VL`
* @param {NonNegativeInteger} offsetVL - starting index for `VL`
* @param {Complex128Array} VR - right eigenvector matrix
* @param {integer} strideVR1 - stride of first dimension of `VR`
* @param {integer} strideVR2 - stride of second dimension of `VR`
* @param {NonNegativeInteger} offsetVR - starting index for `VR`
* @param {Float64Array} s - output: reciprocal condition numbers of eigenvalues
* @param {integer} strideS - stride length for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @param {Float64Array} SEP - output: reciprocal condition numbers of eigenvectors
* @param {integer} strideSEP - stride length for `SEP`
* @param {NonNegativeInteger} offsetSEP - starting index for `SEP`
* @param {integer} mm - column dimension of VL/VR/WORK
* @param {Int32Array} M - output: M[0] = number of condition numbers produced
* @param {Complex128Array} WORK - complex workspace
* @param {integer} strideWork1 - stride of first dimension of `WORK`
* @param {integer} strideWork2 - stride of second dimension of `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Float64Array} RWORK - real workspace
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @throws {TypeError} job must be a valid value
* @throws {TypeError} howmny must be a valid value
* @throws {RangeError} N must be nonnegative
* @returns {integer} status code (0 = success)
*/
function ztrsna( job, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, SEP, strideSEP, offsetSEP, mm, M, WORK, strideWork1, strideWork2, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
	if ( job !== 'eigenvalues' && job !== 'eigenvectors' && job !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job value. Value: `%s`.', job ) );
	}
	if ( howmny !== 'all' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid howmny value. Value: `%s`.', howmny ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( job, howmny, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, SEP, strideSEP, offsetSEP, mm, M, WORK, strideWork1, strideWork2, offsetWork, RWORK, strideRWork, offsetRWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztrsna;
