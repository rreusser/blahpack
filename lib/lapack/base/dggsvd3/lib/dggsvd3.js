
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} jobu - jobu
* @param {string} jobv - jobv
* @param {string} jobq - jobq
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} p - p
* @param {Int32Array} K - K
* @param {Int32Array} l - l
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} ALPHA - ALPHA
* @param {integer} strideALPHA - strideALPHA
* @param {Float64Array} BETA - BETA
* @param {integer} strideBETA - strideBETA
* @param {Float64Array} U - U
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {Float64Array} V - V
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Float64Array} Q - Q
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @param {Int32Array} IWORK - IWORK
* @param {integer} strideIWORK - strideIWORK
* @returns {integer} info status code
*/
function dggsvd3( jobu, jobv, jobq, M, N, p, K, l, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, U, LDU, V, LDV, Q, LDQ, WORK, strideWORK, lwork, IWORK, strideIWORK ) { // eslint-disable-line max-len, max-params
	var oalpha;
	var oiwork;
	var obeta;
	var owork;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sq1;
	var sq2;
	var su1;
	var su2;
	var sv1;
	var sv2;

	sa1 = 1;
	sa2 = LDA;
	sb1 = 1;
	sb2 = LDB;
	su1 = 1;
	su2 = LDU;
	sv1 = 1;
	sv2 = LDV;
	sq1 = 1;
	sq2 = LDQ;
	oalpha = stride2offset( N, strideALPHA );
	obeta = stride2offset( N, strideBETA );
	owork = stride2offset( N, strideWORK );
	oiwork = stride2offset( N, strideIWORK );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,M). Value: `%d`.', LDB ) );
	}
	if ( LDU < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDU ) );
	}
	if ( LDV < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,M). Value: `%d`.', LDV ) );
	}
	if ( LDQ < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-second argument must be greater than or equal to max(1,M). Value: `%d`.', LDQ ) );
	}
	if ( jobu !== 'compute-U' && jobu !== 'none' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `jobu` value. Value: `%s`.', jobu ) );
	}
	if ( jobv !== 'compute-V' && jobv !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobv` value. Value: `%s`.', jobv ) );
	}
	if ( jobq !== 'compute-Q' && jobq !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `jobq` value. Value: `%s`.', jobq ) );
	}
	return base( jobu, jobv, jobq, M, N, p, K, l, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHA, strideALPHA, oalpha, BETA, strideBETA, obeta, U, su1, su2, 0, V, sv1, sv2, 0, Q, sq1, sq2, 0, WORK, strideWORK, owork, lwork, IWORK, strideIWORK, oiwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dggsvd3;
