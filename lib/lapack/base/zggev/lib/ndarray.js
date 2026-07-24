/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute the generalized eigenvalues and optionally the left and/or.
* right generalized eigenvectors of a complex matrix pair (A, B).
*
* @param {string} jobvl - `'none'` or `'compute'`
* @param {string} jobvr - `'none'` or `'compute'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - first complex matrix (modified in-place)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - second complex matrix (modified in-place)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} ALPHA - output eigenvalue numerators
* @param {integer} strideALPHA - stride for ALPHA (complex elements)
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA (complex elements)
* @param {Complex128Array} BETA - output eigenvalue denominators
* @param {integer} strideBETA - stride for BETA (complex elements)
* @param {NonNegativeInteger} offsetBETA - starting index for BETA (complex elements)
* @param {Complex128Array} VL - left eigenvector matrix
* @param {integer} strideVL1 - stride of the first dimension of VL (complex elements)
* @param {integer} strideVL2 - stride of the second dimension of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - starting index for VL (complex elements)
* @param {Complex128Array} VR - right eigenvector matrix
* @param {integer} strideVR1 - stride of the first dimension of VR (complex elements)
* @param {integer} strideVR2 - stride of the second dimension of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - starting index for VR (complex elements)
* @param {Complex128Array} WORK - caller-provided complex workspace (length >= N + max(1,(N*32)+(33*32)))
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - caller-provided real workspace (length >= max(1,8*N))
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @throws {TypeError} first argument must be a valid job type
* @throws {TypeError} second argument must be a valid job type
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} WORK array must have sufficient length
* @throws {RangeError} RWORK array must have sufficient length
* @returns {integer} INFO: 0=success, 1..N=QZ iteration failed to converge, N+1=other QZ failure, N+2=ZTGEVC error
*/
function zggev( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	if ( jobvl !== 'compute' && jobvl !== 'none' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job type. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'compute' && jobvr !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid job type. Value: `%s`.', jobvr ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	const minWork = N + Math.max( 1, ( N * 32 ) + ( 33 * 32 ) );
	if ( ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, WORK.length ) );
	}
	const minRWork = Math.max( 1, 8 * N );
	if ( ( RWORK.length - offsetRWork ) < minRWork ) {
		throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', minRWork, offsetRWork, RWORK.length ) );
	}
	return base( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );
}


// EXPORTS //

export default zggev;
