
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a generalized RQ factorization of an M-by-N matrix A and a P-by-N matrix B.
*
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {Complex128Array} A - M-by-N matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAUA - scalar factors for Q
* @param {integer} strideTAUA - stride for TAUA
* @param {Complex128Array} B - P-by-N matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} TAUB - scalar factors for Z
* @param {integer} strideTAUB - stride for TAUB
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWORK - stride for WORK
* @param {integer} lwork - workspace size
* @returns {integer} status code (0 = success)
*/
function zggrqf( M, p, N, A, LDA, TAUA, strideTAUA, B, LDB, TAUB, strideTAUB, WORK, strideWORK, lwork ) { // eslint-disable-line max-len, max-params
	var otaua;
	var otaub;
	var owork;
	var sa1;
	var sa2;
	var sb1;
	var sb2;

	sa1 = 1;
	sa2 = LDA;
	sb1 = 1;
	sb2 = LDB;
	otaua = stride2offset( Math.min( M, N ), strideTAUA );
	otaub = stride2offset( Math.min( p, N ), strideTAUB );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = max(1;
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	owork = stride2offset( lwork, strideWORK );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDB ) );
	}
	return base( M, p, N, A, sa1, sa2, 0, TAUA, strideTAUA, otaua, B, sb1, sb2, 0, TAUB, strideTAUB, otaub, WORK, strideWORK, owork, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zggrqf;
