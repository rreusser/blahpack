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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes eigenvalues and, optionally, eigenvectors with optional balancing and reciprocal condition numbers for a complex nonsymmetric matrix, using alternative indexing semantics.
*
* @param {('none'|'permute'|'scale'|'both')} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {('no-vectors'|'compute-vectors')} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {('no-vectors'|'compute-vectors')} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {('none'|'eigenvalues'|'right-vectors'|'both')} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - first dim stride of A
* @param {integer} strideA2 - second dim stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Complex128Array} w - eigenvalues
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} VL - left eigenvectors
* @param {integer} strideVL1 - first dim stride of VL
* @param {integer} strideVL2 - second dim stride of VL
* @param {NonNegativeInteger} offsetVL - starting index for VL
* @param {Complex128Array} VR - right eigenvectors
* @param {integer} strideVR1 - first dim stride of VR
* @param {integer} strideVR2 - second dim stride of VR
* @param {NonNegativeInteger} offsetVR - starting index for VR
* @param {Int32Array} ilo - input/output (length-1 array): ignored on input; returned in result
* @param {Int32Array} ihi - input/output (length-1 array): ignored on input; returned in result
* @param {Float64Array} SCALE - output scaling factors
* @param {integer} strideSCALE - stride for SCALE
* @param {NonNegativeInteger} offsetSCALE - starting index for SCALE
* @param {Float64Array} abnrm - input/output (length-1 array): ignored on input; returned in result
* @param {Float64Array} RCONDE - reciprocal condition numbers for eigenvalues
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - starting index for RCONDE
* @param {Float64Array} RCONDV - reciprocal condition numbers for eigenvectors
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - starting index for RCONDV
* @param {Complex128Array} WORK - complex workspace
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Float64Array} RWORK - real workspace
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @throws {TypeError} first argument must be one of the following: "both", "none", "permute", "scale"
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} fourth argument is invalid (rejected when `!( ( ( sense === "none" || sense === "eigenvalues" ) || sense === "both" ) || sense === "right-vectors" ) || ( ( sense === "eigenvalues" || sense === "both" ) && !( jobvl === "compute-vectors" && jobvr === "compute-vectors" ) )`)
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {TypeError} balanc must be a valid balanc value
* @throws {TypeError} jobvl must be a valid jobvl value
* @throws {TypeError} jobvr must be a valid jobvr value
* @throws {TypeError} sense must be a valid sense value
* @throws {RangeError} N must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function zgeevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, SCALE, strideSCALE, offsetSCALE, abnrm, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	let need;
	if ( balanc !== 'both' && balanc !== 'none' && balanc !== 'permute' && balanc !== 'scale' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "both", "none", "permute", "scale". Value: `%s`.', balanc ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvr ) );
	}
	if ( !( ( ( sense === 'none' || sense === 'eigenvalues' ) || sense === 'both' ) || sense === 'right-vectors' ) || ( ( sense === 'eigenvalues' || sense === 'both' ) && !( jobvl === 'compute-vectors' && jobvr === 'compute-vectors' ) ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument is invalid (rejected when `!( ( ( sense === "none" || sense === "eigenvalues" ) || sense === "both" ) || sense === "right-vectors" ) || ( ( sense === "eigenvalues" || sense === "both" ) && !( jobvl === "compute-vectors" && jobvr === "compute-vectors" ) )`). Value: `%s`.', sense ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns WORK; ZGEEVX requires at least `max( 1, 2*N )` complex
	// elements, or `N*N + 2*N` when SENSE is 'right-vectors'/'both'. Reject an
	// undersized buffer with a loud RangeError.
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	if ( sense === 'right-vectors' || sense === 'both' ) {
		need = max( 1, ( N*N ) + ( 2*N ) );
	} else {
		need = max( 1, 2*N );
	}
	if ( !WORK || ( WORK.length - offsetWork ) < need ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, SCALE, strideSCALE, offsetSCALE, abnrm, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );
}


// EXPORTS //

export default zgeevx;
