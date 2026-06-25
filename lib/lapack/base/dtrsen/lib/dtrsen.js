
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} job - job
* @param {string} compq - compq
* @param {Uint8Array|Array} SELECT - SELECT
* @param {integer} strideSELECT - strideSELECT
* @param {NonNegativeInteger} N - N
* @param {Float64Array} T - T
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} Q - Q
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} WR - WR
* @param {integer} strideWR - strideWR
* @param {Float64Array} WI - WI
* @param {integer} strideWI - strideWI
* @param {Float64Array} M - M
* @param {Float64Array} s - s
* @param {Float64Array} sep - sep
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @param {Int32Array} IWORK - IWORK
* @param {integer} strideIWORK - strideIWORK
* @param {integer} liwork - liwork
* @returns {integer} info status code
*/
function dtrsen( job, compq, SELECT, strideSELECT, N, T, LDT, Q, LDQ, WR, strideWR, WI, strideWI, M, s, sep, WORK, strideWORK, lwork, IWORK, strideIWORK, liwork ) { // eslint-disable-line max-len, max-params
	var oselect;
	var oiwork;
	var owork;
	var owi;
	var owr;
	var sq1;
	var sq2;
	var st1;
	var st2;

	st1 = 1;
	st2 = LDT;
	sq1 = 1;
	sq2 = LDQ;
	oselect = stride2offset( N, strideSELECT );
	owr = stride2offset( N, strideWR );
	owi = stride2offset( N, strideWI );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1,N);
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = 1;;
		IWORK = new Int32Array( minIwork );
		strideIWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	oiwork = stride2offset( N, strideIWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( LDT < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDT ) );
	}
	if ( LDQ < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDQ ) );
	}
	if ( job !== 'both' && job !== 'eigenvalues' && job !== 'subspace' && job !== 'none' && job !== 'E' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `job` value. Value: `%s`.', job ) );
	}
	if ( compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `compq` value. Value: `%s`.', compq ) );
	}
	return base( job, compq, SELECT, strideSELECT, oselect, N, T, st1, st2, 0, Q, sq1, sq2, 0, WR, strideWR, owr, WI, strideWI, owi, M, s, sep, WORK, strideWORK, owork, lwork, IWORK, strideIWORK, oiwork, liwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrsen;
