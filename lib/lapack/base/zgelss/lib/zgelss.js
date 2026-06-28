
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} nrhs - nrhs
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} S - S
* @param {integer} strideS - strideS
* @param {number} rcond - rcond
* @param {Array} rank - rank
* @param {Complex128Array} WORK - WORK
* @param {integer} strideWork - strideWork
* @param {integer} lwork - lwork
* @param {Float64Array} RWORK - RWORK
* @param {integer} strideRWork - strideRWork
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 if successful, >0 if ZBDSQR did not converge
*/
function zgelss( M, N, nrhs, A, LDA, B, LDB, S, strideS, rcond, rank, WORK, strideWork, lwork, RWORK, strideRWork ) { // eslint-disable-line max-len, max-params
	var orwork;
	var owork;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var os;

	sa1 = 1;
	sa2 = LDA;
	sb1 = 1;
	sb2 = LDB;
	os = stride2offset( N, strideS );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = 1;
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, 5 * Math.min( M, N) );
		RWORK = new Float64Array( minRwork );
		strideRWork = 1;
	}
	owork = stride2offset( N, strideWork );
	orwork = stride2offset( N, strideRWork );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDB ) );
	}
	return base( M, N, nrhs, A, sa1, sa2, 0, B, sb1, sb2, 0, S, strideS, os, rcond, rank, WORK, strideWork, owork, lwork, RWORK, strideRWork, orwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgelss;
