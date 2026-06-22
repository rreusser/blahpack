
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a complex general band matrix to real upper bidiagonal form.
*
* @param {string} vect - one of `'no-vectors'`, `'q-only'`, `'p-only'`, or `'both'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} ncc - number of columns of C
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Complex128Array} AB - band matrix
* @param {integer} strideAB1 - stride of the first dimension of `AB` (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (in complex elements)
* @param {Float64Array} d - real diagonal of B
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - real superdiagonal of B
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Complex128Array} Q - on output, the unitary matrix Q (if requested)
* @param {integer} strideQ1 - stride of the first dimension of `Q` (in complex elements)
* @param {integer} strideQ2 - stride of the second dimension of `Q` (in complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for `Q` (in complex elements)
* @param {Complex128Array} PT - on output, the unitary matrix P**H (if requested)
* @param {integer} stridePT1 - stride of the first dimension of `PT` (in complex elements)
* @param {integer} stridePT2 - stride of the second dimension of `PT` (in complex elements)
* @param {NonNegativeInteger} offsetPT - starting index for `PT` (in complex elements)
* @param {Complex128Array} C - on input, m-by-ncc matrix; on output, Q**H*C
* @param {integer} strideC1 - stride of the first dimension of `C` (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of `C` (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for `C` (in complex elements)
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWORK - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @param {Float64Array} RWORK - real workspace array
* @param {integer} strideRWORK - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWORK - starting index for `RWORK`
* @throws {TypeError} first argument must be a valid `vect` value
* @returns {integer} status code (0 = success)
*/
function zgbbrd( vect, M, N, ncc, kl, ku, AB, strideAB1, strideAB2, offsetAB, d, strideD, offsetD, e, strideE, offsetE, Q, strideQ1, strideQ2, offsetQ, PT, stridePT1, stridePT2, offsetPT, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ) { // eslint-disable-line max-len, max-params
	if ( vect !== 'no-vectors' && vect !== 'q-only' && vect !== 'p-only' && vect !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `vect` value. Value: `%s`.', vect ) );
	}
	return base( vect, M, N, ncc, kl, ku, AB, strideAB1, strideAB2, offsetAB, d, strideD, offsetD, e, strideE, offsetE, Q, strideQ1, strideQ2, offsetQ, PT, stridePT1, stridePT2, offsetPT, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgbbrd;
