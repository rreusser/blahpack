
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the generalized eigenvalues, the generalized real Schur form (S,T).
* and optionally the left and/or right matrices of Schur vectors for a pair of
* N-by-N real nonsymmetric matrices (A,B).
*
* @param {string} jobvsl - `'compute-vectors'` to compute left Schur vectors, `'no-vectors'` to not
* @param {string} jobvsr - `'compute-vectors'` to compute right Schur vectors, `'no-vectors'` to not
* @param {string} sort - `'sorted'` to order eigenvalues, `'not-sorted'` to not
* @param {Function} selctg - selection function `(alphar, alphai, beta) => boolean`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input matrix A (N x N), overwritten by Schur form S on exit
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - input matrix B (N x N), overwritten by triangular form T on exit
* @param {integer} strideB1 - first dimension stride of B
* @param {integer} strideB2 - second dimension stride of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} ALPHAR - output: real parts of alpha (length N)
* @param {integer} strideALPHAR - stride for ALPHAR
* @param {NonNegativeInteger} offsetALPHAR - offset for ALPHAR
* @param {Float64Array} ALPHAI - output: imaginary parts of alpha (length N)
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {NonNegativeInteger} offsetALPHAI - offset for ALPHAI
* @param {Float64Array} BETA - output: beta values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - offset for BETA
* @param {Float64Array} VSL - output: left Schur vectors (N x N)
* @param {integer} strideVSL1 - first dimension stride of VSL
* @param {integer} strideVSL2 - second dimension stride of VSL
* @param {NonNegativeInteger} offsetVSL - starting index for VSL
* @param {Float64Array} VSR - output: right Schur vectors (N x N)
* @param {integer} strideVSR1 - first dimension stride of VSR
* @param {integer} strideVSR2 - second dimension stride of VSR
* @param {NonNegativeInteger} offsetVSR - starting index for VSR
* @throws {TypeError} first argument must be a valid jobvsl value
* @throws {TypeError} second argument must be a valid jobvsr value
* @throws {RangeError} fifth argument must be a nonnegative integer
* @returns {Object} result with properties: info (integer status code), sdim (number of sorted eigenvalues)
*/
function dgges( jobvsl, jobvsr, sort, selctg, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR ) { // eslint-disable-line max-len, max-params
	if ( jobvsl !== 'no-vectors' && jobvsl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid jobvsl value. Value: `%s`.', jobvsl ) );
	}
	if ( jobvsr !== 'no-vectors' && jobvsr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid jobvsr value. Value: `%s`.', jobvsr ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( jobvsl, jobvsr, sort, selctg, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VSL, strideVSL1, strideVSL2, offsetVSL, VSR, strideVSR1, strideVSR2, offsetVSR ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgges;
