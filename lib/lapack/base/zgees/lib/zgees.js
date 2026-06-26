
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} jobvs - jobvs
* @param {string} sort - sort
* @param {Function} select - select
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} sdim - sdim
* @param {Complex128Array} W - W
* @param {integer} strideW - strideW
* @param {Complex128Array} VS - VS
* @param {PositiveInteger} LDVS - leading dimension of `VS`
* @param {Complex128Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @param {Float64Array} RWORK - RWORK
* @param {integer} strideRWORK - strideRWORK
* @param {Uint8Array} BWORK - BWORK
* @param {integer} strideBWORK - strideBWORK
* @returns {integer} info status code
*/
function zgees( jobvs, sort, select, N, A, LDA, sdim, W, strideW, VS, LDVS, WORK, strideWORK, lwork, RWORK, strideRWORK, BWORK, strideBWORK ) { // eslint-disable-line max-len, max-params
	var obwork;
	var orwork;
	var owork;
	var svs1;
	var svs2;
	var sa1;
	var sa2;
	var ow;

	sa1 = 1;
	sa2 = LDA;
	svs1 = 1;
	svs2 = LDVS;
	ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N);
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
		strideRWORK = 1;
	}
	if ( BWORK === null || BWORK === void 0 ) {
		var minBwork = Math.max( 1, 2 * N);
		BWORK = new Uint8Array( minBwork );
		strideBWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	orwork = stride2offset( N, strideRWORK );
	obwork = stride2offset( N, strideBWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDVS < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDVS ) );
	}
	if ( jobvs !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `jobvs` value. Value: `%s`.', jobvs ) );
	}
	if ( sort !== 'sort' && sort !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `sort` value. Value: `%s`.', sort ) );
	}
	return base( jobvs, sort, select, N, A, sa1, sa2, 0, sdim, W, strideW, ow, VS, svs1, svs2, 0, WORK, strideWORK, owork, lwork, RWORK, strideRWORK, orwork, BWORK, strideBWORK, obwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgees;
