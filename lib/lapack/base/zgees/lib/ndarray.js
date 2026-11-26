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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes for an N-by-N complex nonsymmetric matrix A, the eigenvalues.
* the Schur form T, and, optionally, the matrix of Schur vectors Z.
* This gives the Schur factorization A = Z_T_(Z**H).
*
* Optionally, it also orders the eigenvalues on the diagonal of the Schur
* form so that selected eigenvalues are at the top left. The leading columns
* of Z then form an orthonormal basis for the invariant subspace corresponding
* to the selected eigenvalues.
*
* A complex matrix is in Schur form if it is upper triangular.
*
* @param {('no-vectors'|'compute-vectors')} jobvs - `'none'` or `'compute-vectors'`
* @param {('none'|'sort')} sort - `'none'` or `'sort'`
* @param {Function} select - function(W) returning boolean, where W is Complex128; used when sort=`'sort'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - N-by-N matrix, overwritten with Schur form T on exit
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Int32Array} sdim - output: sdim[0] = number of eigenvalues for which SELECT is true
* @param {Complex128Array} W - output: eigenvalues
* @param {integer} strideW - stride for W (complex elements)
* @param {NonNegativeInteger} offsetW - starting index for W (complex elements)
* @param {Complex128Array} VS - output: N-by-N matrix of Schur vectors (if jobvs=`'compute-vectors'`)
* @param {integer} strideVS1 - stride of first dimension of VS (complex elements)
* @param {integer} strideVS2 - stride of second dimension of VS (complex elements)
* @param {NonNegativeInteger} offsetVS - starting index for VS (complex elements)
* @param {Complex128Array} WORK - workspace of at least `max(1,2*N)` complex elements (the reference's minimum); for good performance, the optimum MAXWRK the wrapper allocates for `null`
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace of length N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @param {Uint8Array} BWORK - boolean workspace of length N (used when sort=`'sort'`)
* @param {integer} strideBWork - stride for BWORK
* @param {NonNegativeInteger} offsetBWork - starting index for BWORK
* @throws {TypeError} first argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} second argument must be one of the following: "none", "sort"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info (0=success, >0 = failure)
*/
function zgees( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, W, strideW, offsetW, VS, strideVS1, strideVS2, offsetVS, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, BWORK, strideBWork, offsetBWork ) { // eslint-disable-line max-len, max-params
	if ( jobvs !== 'no-vectors' && jobvs !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvs ) );
	}
	if ( sort !== 'none' && sort !== 'sort' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "none", "sort". Value: `%s`.', sort ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// The reference's minimum, `max( 1, 2*N )` complex elements: zgehrd, zunghr,
	// zhseqr and ztrsen adapt to the workspace they are given.
	const need = max( 1, 2*N );
	if ( !WORK || ( WORK.length - offsetWork ) < need ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideRWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideRWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideRWork ) );
	}
	if ( strideBWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideBWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideBWork ) );
	}
	return base( jobvs, sort, select, N, A, strideA1, strideA2, offsetA, sdim, W, strideW, offsetW, VS, strideVS1, strideVS2, offsetVS, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, BWORK, strideBWork, offsetBWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgees;
