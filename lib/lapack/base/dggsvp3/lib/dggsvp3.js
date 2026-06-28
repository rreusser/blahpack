
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
* @param {NonNegativeInteger} p - p
* @param {NonNegativeInteger} N - N
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {number} tola - tola
* @param {number} tolb - tolb
* @param {Array} K - K
* @param {Array} l - l
* @param {Float64Array} U - U
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {Float64Array} V - V
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Float64Array} Q - Q
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Int32Array} IWORK - IWORK
* @param {integer} strideIWORK - strideIWORK
* @param {Float64Array} TAU - TAU
* @param {integer} strideTAU - strideTAU
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dggsvp3( jobu, jobv, jobq, M, p, N, A, LDA, B, LDB, tola, tolb, K, l, U, LDU, V, LDV, Q, LDQ, IWORK, strideIWORK, TAU, strideTAU, WORK, strideWORK, lwork ) { // eslint-disable-line max-len, max-params
	var oiwork;
	var owork;
	var otau;
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
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
		strideIWORK = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, M, N, p );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	oiwork = stride2offset( N, strideIWORK );
	otau = stride2offset( N, strideTAU );
	owork = stride2offset( N, strideWORK );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDB ) );
	}
	if ( LDU < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDU ) );
	}
	if ( LDV < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDV ) );
	}
	if ( LDQ < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,M). Value: `%d`.', LDQ ) );
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
	return base( jobu, jobv, jobq, M, p, N, A, sa1, sa2, 0, B, sb1, sb2, 0, tola, tolb, K, l, U, su1, su2, 0, V, sv1, sv2, 0, Q, sq1, sq2, 0, IWORK, strideIWORK, oiwork, TAU, strideTAU, otau, WORK, strideWORK, owork, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dggsvp3;
