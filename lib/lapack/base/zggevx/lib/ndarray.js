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


// FUNCTIONS //

/**
* Returns the minimum complex WORK length required by zggevx.
*
* @param {string} sense - condition-number selector
* @param {NonNegativeInteger} N - matrix order
* @returns {PositiveInteger} minimum length
*/
function minWorkLength( sense, N ) {
	let need;
	if ( N === 0 ) {
		return 1;
	}
	// The reference's minimum (ZGGEVX's MINWRK):
	need = 2 * N;
	if ( sense === 'eigenvalues' ) {
		need = 4 * N;
	} else if ( sense === 'right-vectors' || sense === 'both' ) {
		need = 2 * N * ( N + 1 );
	}
	return need;
}


// MAIN //

/**
* Computes, for a pair of N-by-N complex matrices (A, B), the generalized.
* eigenvalues and, optionally, the left and/or right generalized eigenvectors,
* with optional balancing. Strides and offsets follow `ndarray` conventions.
*
* @param {('none'|'permute'|'scale'|'both')} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {('no-vectors'|'compute-vectors')} jobvl - `'no-vectors'` or `'compute-vectors'`
* @param {('no-vectors'|'compute-vectors')} jobvr - `'no-vectors'` or `'compute-vectors'`
* @param {('none'|'eigenvalues'|'right-vectors'|'both')} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
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
* @param {integer} strideVL1 - first dim stride of VL (complex elements)
* @param {integer} strideVL2 - second dim stride of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - offset for VL (complex elements)
* @param {Complex128Array} VR - right eigenvector matrix
* @param {integer} strideVR1 - first dim stride of VR (complex elements)
* @param {integer} strideVR2 - second dim stride of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - offset for VR (complex elements)
* @param {Int32Array} ilo - output (length-1 array): `ilo`
* @param {Int32Array} ihi - output (length-1 array): iLO and IHI are integer values such that on exit A(i,j) = 0 and B(i,j) = 0 if i > j and j = 1,...,ILO-1 or i = IHI+1,...,N
* @param {Float64Array} LSCALE - output: details of left permutations/scaling
* @param {integer} strideLSCALE - stride for LSCALE
* @param {NonNegativeInteger} offsetLSCALE - offset for LSCALE
* @param {Float64Array} RSCALE - output: details of right permutations/scaling
* @param {integer} strideRSCALE - stride for RSCALE
* @param {NonNegativeInteger} offsetRSCALE - offset for RSCALE
* @param {Float64Array} abnrm - output (length-1 array): the one-norm of the balanced matrix A
* @param {Float64Array} bbnrm - output (length-1 array): the one-norm of the balanced matrix B
* @param {Float64Array} RCONDE - output: reciprocal condition numbers for eigenvalues
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - offset for RCONDE
* @param {Float64Array} RCONDV - output: reciprocal condition numbers for right eigenvectors
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - offset for RCONDV
* @param {Complex128Array} WORK - complex workspace of length at least `max(1,2*N)`, `max(1,4*N)` if `sense` is 'eigenvalues', `max(1,2*N*N+2*N)` if 'right-vectors' or 'both'; for optimal performance at least `max( minimum, N + N*NB + TSIZE )` (`NB = 32`, `TSIZE = 4160`), the reference's `N + N*NB` with the zunmqr optimum's T part, which enables the blocked QR steps
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace; length >= 6*N if `balanc` is 'scale' or 'both', else >= 2*N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - offset for RWORK
* @param {Int32Array} IWORK - integer workspace; length >= N+6 if `sense` is 'right-vectors' or 'both' (unreferenced otherwise)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - offset for IWORK
* @param {Uint8Array} BWORK - boolean workspace; length >= N unless `sense` is 'none' (unreferenced otherwise)
* @param {integer} strideBWork - stride for BWORK
* @param {NonNegativeInteger} offsetBWork - offset for BWORK
* @throws {TypeError} first argument must be one of the following: "both", "none", "permute", "scale"
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} fourth argument must be one of the following: "both", "eigenvalues", "none", "right-vectors"
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} workspace arrays must be large enough
* @returns {integer} status code (0 = success)
*/
function zggevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, abnrm, bbnrm, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, BWORK, strideBWork, offsetBWork ) {
	if ( balanc !== 'both' && balanc !== 'none' && balanc !== 'permute' && balanc !== 'scale' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "both", "none", "permute", "scale". Value: `%s`.', balanc ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvr ) );
	}
	if ( sense !== 'both' && sense !== 'eigenvalues' && sense !== 'none' && sense !== 'right-vectors' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "both", "eigenvalues", "none", "right-vectors". Value: `%s`.', sense ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const minWork = minWorkLength( sense, N );
	const minRWork = ( balanc === 'scale' || balanc === 'both' ) ? Math.max( 1, 6 * N ) : Math.max( 1, 2 * N );
	const minIWork = ( sense === 'right-vectors' || sense === 'both' ) ? N + 6 : 0;
	const minBWork = ( sense === 'none' ) ? 0 : N;
	if ( WORK.length < offsetWork + ( ( minWork - 1 ) * strideWork ) + 1 ) {
		throw new RangeError( format( 'invalid argument. `WORK` must have at least %d elements (stride %d, offset %d). Length: `%d`.', minWork, strideWork, offsetWork, WORK.length ) );
	}
	if ( RWORK.length < offsetRWork + ( ( minRWork - 1 ) * strideRWork ) + 1 ) {
		throw new RangeError( format( 'invalid argument. `RWORK` must have at least %d elements (stride %d, offset %d). Length: `%d`.', minRWork, strideRWork, offsetRWork, RWORK.length ) );
	}
	if ( minIWork > 0 && IWORK.length < offsetIWork + ( ( minIWork - 1 ) * strideIWork ) + 1 ) {
		throw new RangeError( format( 'invalid argument. `IWORK` must have at least %d elements (stride %d, offset %d). Length: `%d`.', minIWork, strideIWork, offsetIWork, IWORK.length ) );
	}
	if ( minBWork > 0 && BWORK.length < offsetBWork + ( ( minBWork - 1 ) * strideBWork ) + 1 ) {
		throw new RangeError( format( 'invalid argument. `BWORK` must have at least %d elements (stride %d, offset %d). Length: `%d`.', minBWork, strideBWork, offsetBWork, BWORK.length ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	if ( strideBWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideBWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideBWork ) );
	}
	return base( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, abnrm, bbnrm, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, BWORK, strideBWork, offsetBWork );
}


// EXPORTS //

export default zggevx;
