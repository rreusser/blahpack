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
import base from './base.js';


// MAIN //

/**
* Reduces a real general band matrix to upper bidiagonal form.
*
* @param {('no-vectors'|'q-only'|'p-only'|'both')} vect - one of `'no-vectors'`, `'q-only'`, `'p-only'`, or `'both'`
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} ncc - number of columns of C
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Float64Array} AB - band storage of A
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} d - output: diagonal of B
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - output: superdiagonal of B
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} Q - output: orthogonal matrix Q (if requested)
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} PT - output: orthogonal matrix P**T (if requested)
* @param {integer} stridePT1 - stride of the first dimension of `PT`
* @param {integer} stridePT2 - stride of the second dimension of `PT`
* @param {NonNegativeInteger} offsetPT - starting index for `PT`
* @param {Float64Array} C - input/output: m-by-ncc matrix overwritten by Q**T*C
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Float64Array} WORK - workspace of length 2*max(M,N)
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {TypeError} first argument must be one of the following: "both", "no-vectors", "p-only", "q-only"
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {TypeError} `vect` must be one of "no-vectors", "q-only", "p-only", or "both"
* @throws {RangeError} `M` must be a nonnegative integer
* @throws {RangeError} `N` must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dgbbrd( vect, M, N, ncc, kl, ku, AB, strideAB1, strideAB2, offsetAB, d, strideD, offsetD, e, strideE, offsetE, Q, strideQ1, strideQ2, offsetQ, PT, stridePT1, stridePT2, offsetPT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( vect !== 'both' && vect !== 'no-vectors' && vect !== 'p-only' && vect !== 'q-only' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "both", "no-vectors", "p-only", "q-only". Value: `%s`.', vect ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ncc < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', ncc ) );
	}
	if ( kl < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', kl ) );
	}
	if ( ku < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', ku ) );
	}
	const minWork = (M === 0 || N === 0) ? 0 : 2 * Math.max( M, N );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( vect, M, N, ncc, kl, ku, AB, strideAB1, strideAB2, offsetAB, d, strideD, offsetD, e, strideE, offsetE, Q, strideQ1, strideQ2, offsetQ, PT, stridePT1, stridePT2, offsetPT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgbbrd;
