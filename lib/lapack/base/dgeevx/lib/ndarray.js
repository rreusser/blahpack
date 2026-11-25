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
* Computes eigenvalues and, optionally, the left and/or right eigenvectors of a real N-by-N nonsymmetric matrix A, plus optionally a balancing transformation, reciprocal condition numbers of eigenvalues, and reciprocal condition numbers of right eigenvectors.
*
* @param {('none'|'permute'|'scale'|'both')} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {('no-vectors'|'compute-vectors')} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {('no-vectors'|'compute-vectors')} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {('none'|'eigenvalues'|'right-vectors'|'both')} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - first-dimension stride of A
* @param {integer} strideA2 - second-dimension stride of A
* @param {NonNegativeInteger} offsetA - offset for A
* @param {Float64Array} WR - output: real parts of eigenvalues
* @param {integer} strideWR - stride for WR
* @param {NonNegativeInteger} offsetWR - offset for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues
* @param {integer} strideWI - stride for WI
* @param {NonNegativeInteger} offsetWI - offset for WI
* @param {Float64Array} VL - output: left eigenvectors
* @param {integer} strideVL1 - first-dimension stride of VL
* @param {integer} strideVL2 - second-dimension stride of VL
* @param {NonNegativeInteger} offsetVL - offset for VL
* @param {Float64Array} VR - output: right eigenvectors
* @param {integer} strideVR1 - first-dimension stride of VR
* @param {integer} strideVR2 - second-dimension stride of VR
* @param {NonNegativeInteger} offsetVR - offset for VR
* @param {Int32Array} ilo - output (length-1 array): `ilo`
* @param {Int32Array} ihi - output (length-1 array): iLO and IHI are integer values determined when A was balanced
* @param {Float64Array} SCALE - output: balancing/scaling details
* @param {integer} strideSCALE - stride for SCALE
* @param {NonNegativeInteger} offsetSCALE - offset for SCALE
* @param {Float64Array} abnrm - output (length-1 array): the one-norm of the balanced matrix (the maximum of the sum of absolute values of elements of any column)
* @param {Float64Array} RCONDE - output: reciprocal condition numbers for eigenvalues
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - offset for RCONDE
* @param {Float64Array} RCONDV - output: reciprocal condition numbers for right eigenvectors
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - offset for RCONDV
* @param {Float64Array} work - workspace array (size >= max(1, N*(N+7)))
* @param {integer} strideWork - stride for work
* @param {NonNegativeInteger} offsetWork - offset for work
* @param {Int32Array} iwork - integer workspace array (size >= max(1, 2*(N-1))); only referenced when sense != 'none'
* @param {integer} strideIwork - stride for iwork
* @param {NonNegativeInteger} offsetIwork - offset for iwork
* @throws {TypeError} first argument must be one of the following: "both", "none", "permute", "scale"
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} fourth argument is invalid (rejected when `!( ( ( sense === "none" || sense === "eigenvalues" ) || sense === "both" ) || sense === "right-vectors" ) || ( ( sense === "eigenvalues" || sense === "both" ) && !( jobvl === "compute-vectors" && jobvr === "compute-vectors" ) )`)
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {TypeError} must supply valid `balanc`, `jobvl`, `jobvr`, `sense`
* @throws {RangeError} `N` must be nonnegative
* @throws {RangeError} `work` must have at least `max(1, N*(N+7))` elements from offset
* @throws {RangeError} `iwork` must have at least `max(1, 2*(N-1))` elements from offset
* @returns {integer} status code (0 = success)
*/
function dgeevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, SCALE, strideSCALE, offsetSCALE, abnrm, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, work, strideWork, offsetWork, iwork, strideIwork, offsetIwork ) {

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
	const minWork = Math.max( 1, N * ( N + 7 ) );
	if ( ( work.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. `work` array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, work.length ) );
	}
	const minIwork = Math.max( 1, 2 * ( N - 1 ) );
	if ( ( iwork.length - offsetIwork ) < minIwork ) {
		throw new RangeError( format( 'invalid argument. `iwork` array must have at least %d elements from offset %d. Provided length: %d.', minIwork, offsetIwork, iwork.length ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideIwork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIwork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIwork ) );
	}
	return base( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, SCALE, strideSCALE, offsetSCALE, abnrm, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, work, strideWork, offsetWork, iwork, strideIwork, offsetIwork );
}


// EXPORTS //

export default dgeevx;
