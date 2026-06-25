
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
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} sdim - sdim
* @param {Float64Array} WR - WR
* @param {integer} strideWR - strideWR
* @param {Float64Array} WI - WI
* @param {integer} strideWI - strideWI
* @param {Float64Array} VS - VS
* @param {PositiveInteger} LDVS - leading dimension of `VS`
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @param {Uint8Array} BWORK - BWORK
* @param {integer} strideBWORK - strideBWORK
* @returns {integer} info status code
*/
function dgees( jobvs, sort, select, N, A, LDA, sdim, WR, strideWR, WI, strideWI, VS, LDVS, WORK, strideWORK, lwork, BWORK, strideBWORK ) { // eslint-disable-line max-len, max-params
	var obwork;
	var owork;
	var svs1;
	var svs2;
	var owi;
	var owr;
	var sa1;
	var sa2;

	sa1 = 1;
	sa2 = LDA;
	svs1 = 1;
	svs2 = LDVS;
	owr = stride2offset( N, strideWR );
	owi = stride2offset( N, strideWI );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = ( N === 0 ) ? 1 : Math.max( 1, 3 * N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( BWORK === null || BWORK === void 0 ) {
		var minBwork = Math.max( 1,3 * N);
		BWORK = new Uint8Array( minBwork );
		strideBWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	obwork = stride2offset( N, strideBWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDVS < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVS ) );
	}
	if ( jobvs !== 'no-vectors' && jobvs !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `jobvs` value. Value: `%s`.', jobvs ) );
	}
	if ( sort !== 'none' && sort !== 'sort' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `sort` value. Value: `%s`.', sort ) );
	}
	return base( jobvs, sort, select, N, A, sa1, sa2, 0, sdim, WR, strideWR, owr, WI, strideWI, owi, VS, svs1, svs2, 0, WORK, strideWORK, owork, lwork, BWORK, strideBWORK, obwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgees;
