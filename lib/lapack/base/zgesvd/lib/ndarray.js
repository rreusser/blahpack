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
import base, { computeMinWorkSize } from './base.js';


// MAIN //

/**
* Computes the singular value decomposition (SVD) of a complex M-by-N matrix A.
*
* @param {('all-columns'|'economy'|'overwrite'|'none')} jobu - `'all-columns'`: all M columns of U returned, `'economy'`: first min(M,N) columns, `'overwrite'`: overwrite A, `'none'`: no U
* @param {('all-rows'|'economy'|'overwrite'|'none')} jobvt - `'all-rows'`: all N rows of V^H returned, `'economy'`: first min(M,N) rows, `'overwrite'`: overwrite A, `'none'`: no VT
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Complex128Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} s - output array of real singular values (length min(M,N))
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - starting index for s
* @param {Complex128Array} U - output matrix for left singular vectors
* @param {integer} strideU1 - stride of the first dimension of U (in complex elements)
* @param {integer} strideU2 - stride of the second dimension of U (in complex elements)
* @param {NonNegativeInteger} offsetU - starting index for U (in complex elements)
* @param {Complex128Array} VT - output matrix for right singular vectors
* @param {integer} strideVT1 - stride of the first dimension of VT (in complex elements)
* @param {integer} strideVT2 - stride of the second dimension of VT (in complex elements)
* @param {NonNegativeInteger} offsetVT - starting index for VT (in complex elements)
* @param {Complex128Array} WORK - complex workspace of at least the reference's MINWRK,
* `computeMinWorkSize( jobu, jobvt, M, N )` complex elements from `offsetWork` (`3*min(M,N)` when
* M is much larger than N with jobu `'none'`, or N much larger than M with jobvt `'none'`; otherwise
* `2*min(M,N) + max(M,N)`); the reference's MAXWRK, `computeWorkSize( jobu, jobvt, M, N )`,
* enables the fast QR/LQ paths and the callees' blocked code
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @param {Float64Array} RWORK - caller-owned real workspace of at least
* `max(1, 5*min(M,N))` elements from `offsetRWork` (never allocated here)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @throws {TypeError} first argument must be one of the following: "all-columns", "none", "overwrite", "economy"
* @throws {TypeError} second argument is invalid (rejected when `!( ( ( jobvt === "all-rows" || jobvt === "economy" ) || jobvt === "overwrite" ) || jobvt === "none" ) || ( jobvt === "overwrite" && jobu === "overwrite" )`)
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} if WORK or RWORK is too small
* @returns {integer} info - 0 if successful, >0 if ZBDSQR did not converge
*/
function zgesvd( jobu, jobvt, M, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, U, strideU1, strideU2, offsetU, VT, strideVT1, strideVT2, offsetVT, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {

	if ( jobu !== 'all-columns' && jobu !== 'none' && jobu !== 'overwrite' && jobu !== 'economy' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "all-columns", "none", "overwrite", "economy". Value: `%s`.', jobu ) );
	}
	if ( !( ( ( jobvt === 'all-rows' || jobvt === 'economy' ) || jobvt === 'overwrite' ) || jobvt === 'none' ) || ( jobvt === 'overwrite' && jobu === 'overwrite' ) ) {
		throw new TypeError( format( 'invalid argument. Second argument is invalid (rejected when `!( ( ( jobvt === "all-rows" || jobvt === "economy" ) || jobvt === "overwrite" ) || jobvt === "none" ) || ( jobvt === "overwrite" && jobu === "overwrite" )`). Value: `%s`.', jobvt ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Zero-dimensional quick return MUST precede the workspace-size assertions:
	// an empty matrix requires no workspace.
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	// Caller owns WORK/RWORK (base.js never allocates); assert they are large
	// enough so an under-sized buffer is a loud RangeError, not a silent NaN
	// from an out-of-bounds read.
	// The reference's MINWRK for this path (CONVENTIONS W6): base.js chooses its path, and the callees their block sizes, from the workspace given.
	const minWork = computeMinWorkSize( jobu, jobvt, M, N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	const minRWork = Math.max( 1, 5 * Math.min( M, N ) );
	if ( !RWORK || ( RWORK.length - offsetRWork ) < minRWork ) {
		throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', minRWork, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
	}
	return base( jobu, jobvt, M, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, U, strideU1, strideU2, offsetU, VT, strideVT1, strideVT2, offsetVT, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );
}


// EXPORTS //

export default zgesvd;
