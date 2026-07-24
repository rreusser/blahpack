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
* Computes the generalized eigenvalues, the generalized complex Schur form.
* (S,T), and optionally the left and/or right matrices of Schur vectors for
* a pair of N-by-N complex nonsymmetric matrices (A,B).
*
* @param {string} jobvsl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvsr - `'compute-vectors'` or `'no-vectors'`
* @param {string} sort - `'sorted'` or `'not-sorted'`
* @param {Function} selctg - selection function `(alphaRe, alphaIm, betaRe, betaIm) => boolean`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - input matrix A (N x N), overwritten on exit
* @param {integer} strideA1 - first dimension stride of A (complex elements)
* @param {integer} strideA2 - second dimension stride of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - input matrix B (N x N), overwritten on exit
* @param {integer} strideB1 - first dimension stride of B (complex elements)
* @param {integer} strideB2 - second dimension stride of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} ALPHA - output: eigenvalue numerators (length N)
* @param {integer} strideALPHA - stride for ALPHA (complex elements)
* @param {NonNegativeInteger} offsetALPHA - offset for ALPHA (complex elements)
* @param {Complex128Array} BETA - output: eigenvalue denominators (length N)
* @param {integer} strideBETA - stride for BETA (complex elements)
* @param {NonNegativeInteger} offsetBETA - offset for BETA (complex elements)
* @param {Complex128Array} VSL - output: left Schur vectors (N x N)
* @param {integer} strideVSL1 - first dimension stride of VSL (complex elements)
* @param {integer} strideVSL2 - second dimension stride of VSL (complex elements)
* @param {NonNegativeInteger} offsetVSL - starting index for VSL (complex elements)
* @param {Complex128Array} VSR - output: right Schur vectors (N x N)
* @param {integer} strideVSR1 - first dimension stride of VSR (complex elements)
* @param {integer} strideVSR2 - second dimension stride of VSR (complex elements)
* @param {NonNegativeInteger} offsetVSR - starting index for VSR (complex elements)
* @param {Complex128Array} WORK - caller-provided complex workspace; must have at least N + max(8*N, 1) elements from offsetWork
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - caller-provided real workspace; must have at least 2*N + max(8*N, 1) elements from offsetRwork
* @param {integer} strideRwork - stride for RWORK
* @param {NonNegativeInteger} offsetRwork - starting index for RWORK
* @param {Uint8Array} BWORK - caller-provided logical workspace of length at least N from offsetBwork (used when sort='sorted')
* @param {integer} strideBwork - stride for BWORK
* @param {NonNegativeInteger} offsetBwork - starting index for BWORK
* @throws {TypeError} first argument must be a valid `jobvsl` value
* @throws {TypeError} second argument must be a valid `jobvsr` value
* @throws {TypeError} third argument must be a valid `sort` value
* @throws {RangeError} WORK must have sufficient elements
* @throws {RangeError} RWORK must have sufficient elements
* @throws {RangeError} BWORK must have sufficient elements
* @returns {Object} result with properties: info (integer status code), sdim (number of sorted eigenvalues)
*/
function zgges( jobvsl, jobvsr, sort, selctg, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR, WORK, strideWork, offsetWork, RWORK, strideRwork, offsetRwork, BWORK, strideBwork, offsetBwork ) { // eslint-disable-line max-len, max-params
	if ( jobvsl !== 'compute-vectors' && jobvsl !== 'no-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `jobvsl` value. Value: `%s`.', jobvsl ) );
	}
	if ( jobvsr !== 'compute-vectors' && jobvsr !== 'no-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobvsr` value. Value: `%s`.', jobvsr ) );
	}
	if ( sort !== 'sorted' && sort !== 'not-sorted' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `sort` value. Value: `%s`.', sort ) );
	}
	// Zero-dimension quick return (must precede the workspace assertion — an
	// empty problem must not require a valid workspace buffer):
	if ( N === 0 ) {
		return {
			'info': 0,
			'sdim': 0
		};
	}
	const minWork = N + max( 8 * N, 1 );
	if ( ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, WORK.length ) );
	}
	const minRwork = ( 2 * N ) + max( 8 * N, 1 );
	if ( ( RWORK.length - offsetRwork ) < minRwork ) {
		throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', minRwork, offsetRwork, RWORK.length ) );
	}
	const minBwork = N;
	if ( ( BWORK.length - offsetBwork ) < minBwork ) {
		throw new RangeError( format( 'invalid argument. BWORK array must have at least %d elements from offset %d. Provided length: %d.', minBwork, offsetBwork, BWORK.length ) );
	}
	return base( jobvsl, jobvsr, sort, selctg, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR, WORK, strideWork, offsetWork, RWORK, strideRwork, offsetRwork, BWORK, strideBwork, offsetBwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgges;
