/**
 * Compute the eigenvalues of a complex matrix pair (H, T), where H is.
 * upper Hessenberg and T is upper triangular, using the single-shift QZ
 * method. Optionally compute the Schur form and/or Schur vectors.
 *
 * Complex elements are stored as interleaved real/imaginary pairs.
 * Element (i, j) has real part at `offset + i*stride1 + j*stride2` and
 * imaginary part at `offset + i*stride1 + j*stride2 + 1`.
 *
 *
 * @param {string} job - `'eigenvalues'` or `'schur'`
 * @param {string} compq - `'none'`, `'initialize'`, or `'update'`
 * @param {string} compz - `'none'`, `'initialize'`, or `'update'`
 * @param {NonNegativeInteger} N - order of matrices H, T, Q, Z
 * @param {integer} ilo - start of active block (1-based)
 * @param {integer} ihi - end of active block (1-based)
 * @param {Complex128Array} H - upper Hessenberg matrix
 * @param {integer} strideH1 - row stride for H (complex elements)
 * @param {integer} strideH2 - column stride for H (complex elements)
 * @param {NonNegativeInteger} offsetH - starting index for H (complex elements)
 * @param {Complex128Array} T - upper triangular matrix
 * @param {integer} strideT1 - row stride for T (complex elements)
 * @param {integer} strideT2 - column stride for T (complex elements)
 * @param {NonNegativeInteger} offsetT - starting index for T (complex elements)
 * @param {Complex128Array} ALPHA - output eigenvalue numerators
 * @param {integer} strideALPHA - stride for ALPHA (complex elements)
 * @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA (complex elements)
 * @param {Complex128Array} BETA - output eigenvalue denominators
 * @param {integer} strideBETA - stride for BETA (complex elements)
 * @param {NonNegativeInteger} offsetBETA - starting index for BETA (complex elements)
 * @param {Complex128Array} Q - left Schur vectors
 * @param {integer} strideQ1 - row stride for Q (complex elements)
 * @param {integer} strideQ2 - column stride for Q (complex elements)
 * @param {NonNegativeInteger} offsetQ - starting index for Q (complex elements)
 * @param {Complex128Array} Z - right Schur vectors
 * @param {integer} strideZ1 - row stride for Z (complex elements)
 * @param {integer} strideZ2 - column stride for Z (complex elements)
 * @param {NonNegativeInteger} offsetZ - starting index for Z (complex elements)
 * @param {Complex128Array} WORK - workspace
 * @param {integer} strideWORK - stride for WORK (complex elements)
 * @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
 * @param {integer} lwork - workspace size (in complex elements); -1 for query
 * @param {Float64Array} RWORK - real workspace (length >= N)
 * @param {integer} strideRWORK - stride for RWORK
 * @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
 * @returns {integer} INFO: 0=success, 1..N=QZ did not converge, N+1..2N=shift failed
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute the eigenvalues of a complex matrix pair (H, T), where H is.
*
* @param {string} job - `'eigenvalues'` or `'schur'`
* @param {string} compq - `'none'`, `'initialize'`, or `'update'`
* @param {string} compz - `'none'`, `'initialize'`, or `'update'`
* @param {NonNegativeInteger} N - order of matrices H, T, Q, Z
* @param {integer} ilo - start of active block (1-based)
* @param {integer} ihi - end of active block (1-based)
* @param {Complex128Array} H - upper Hessenberg matrix
* @param {integer} strideH1 - row stride for H (complex elements)
* @param {integer} strideH2 - column stride for H (complex elements)
* @param {NonNegativeInteger} offsetH - starting index for H (complex elements)
* @param {Complex128Array} T - upper triangular matrix
* @param {integer} strideT1 - row stride for T (complex elements)
* @param {integer} strideT2 - column stride for T (complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (complex elements)
* @param {Complex128Array} ALPHA - output eigenvalue numerators
* @param {integer} strideALPHA - stride for ALPHA (complex elements)
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA (complex elements)
* @param {Complex128Array} BETA - output eigenvalue denominators
* @param {integer} strideBETA - stride for BETA (complex elements)
* @param {NonNegativeInteger} offsetBETA - starting index for BETA (complex elements)
* @param {Complex128Array} Q - left Schur vectors
* @param {integer} strideQ1 - row stride for Q (complex elements)
* @param {integer} strideQ2 - column stride for Q (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for Q (complex elements)
* @param {Complex128Array} Z - right Schur vectors
* @param {integer} strideZ1 - row stride for Z (complex elements)
* @param {integer} strideZ2 - column stride for Z (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for Z (complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @param {integer} lwork - workspace size (in complex elements); -1 for query
* @param {Float64Array} RWORK - real workspace (length >= N)
* @param {integer} strideRWORK - stride for RWORK
* @param {NonNegativeInteger} offsetRWORK - starting index for RWORK
* @throws {TypeError} first argument must be a valid job type
* @throws {TypeError} second argument must be a valid computation flag
* @throws {TypeError} third argument must be a valid computation flag
* @throws {RangeError} fourth argument must be a nonnegative integer
* @returns {integer} INFO: 0=success, 1..N=QZ did not converge, N+1..2N=shift failed
*/
function zhgeqz( job, compq, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, T, strideT1, strideT2, offsetT, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK ) {
	if ( job !== 'eigenvalues' && job !== 'schur' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job type. Value: `%s`.', job ) );
	}
	if ( compq !== 'none' && compq !== 'initialize' && compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid computation flag. Value: `%s`.', compq ) );
	}
	if ( compz !== 'none' && compz !== 'initialize' && compz !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid computation flag. Value: `%s`.', compz ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return 0;
	}
	return base( job, compq, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, T, strideT1, strideT2, offsetT, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, lwork, RWORK, strideRWORK, offsetRWORK );
}


// EXPORTS //

export default zhgeqz;
