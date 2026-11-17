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
	// TAU (N) plus the QR-step scratch; the JS zgeqrf/zunmqr kernels hardcode NB=32 and need N*NB + (NB+1)*NB once the reduced block exceeds NB:
	need = ( N > 32 ) ? N + ( N * 32 ) + ( 33 * 32 ) : 2 * N;
	if ( sense === 'eigenvalues' ) {
		need = Math.max( need, 4 * N );
	} else if ( sense === 'right-vectors' || sense === 'both' ) {
		need = Math.max( need, ( 2 * N ) + ( 2 * N * N ) + Math.max( 1, 4 * ( N - 1 ) ) );
	}
	return need;
}


// MAIN //

/**
* Computes, for a pair of N-by-N complex matrices (A, B), the generalized.
* eigenvalues and, optionally, the left and/or right generalized eigenvectors,
* with optional balancing. Strides and offsets follow `ndarray` conventions.
*
* @param {string} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} jobvl - `'no-vectors'` or `'compute-vectors'`
* @param {string} jobvr - `'no-vectors'` or `'compute-vectors'`
* @param {string} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
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
* @param {Float64Array} LSCALE - output: details of left permutations/scaling
* @param {integer} strideLSCALE - stride for LSCALE
* @param {NonNegativeInteger} offsetLSCALE - offset for LSCALE
* @param {Float64Array} RSCALE - output: details of right permutations/scaling
* @param {integer} strideRSCALE - stride for RSCALE
* @param {NonNegativeInteger} offsetRSCALE - offset for RSCALE
* @param {Float64Array} RCONDE - output: reciprocal condition numbers for eigenvalues
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - offset for RCONDE
* @param {Float64Array} RCONDV - output: reciprocal condition numbers for right eigenvectors
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - offset for RCONDV
* @param {Complex128Array} WORK - complex workspace; length >= 2*N for N <= 32, else >= N + 32*N + 33*32 (TAU plus the blocked zgeqrf/zunmqr scratch), and also >= 4*N if `sense` is 'eigenvalues', >= 2*N + 2*N*N + max(1,4*(N-1)) if 'right-vectors' or 'both'
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
* @throws {RangeError} workspace arrays must be large enough
* @throws {TypeError} first argument must be a valid balance option
* @throws {TypeError} second argument must be a valid job type
* @throws {TypeError} third argument must be a valid job type
* @throws {TypeError} fourth argument must be a valid sense option
* @returns {Object} result with properties: info, ilo, ihi, abnrm, bbnrm
*/
function zggevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, BWORK, strideBWork, offsetBWork ) {
	if ( balanc !== 'none' && balanc !== 'permute' && balanc !== 'scale' && balanc !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid balance option. Value: `%s`.', balanc ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid job type. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid job type. Value: `%s`.', jobvr ) );
	}
	if ( sense !== 'none' && sense !== 'eigenvalues' && sense !== 'right-vectors' && sense !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid sense option. Value: `%s`.', sense ) );
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
	return base( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, BWORK, strideBWork, offsetBWork );
}


// EXPORTS //

export default zggevx;
