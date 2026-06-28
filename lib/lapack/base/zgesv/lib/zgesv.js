
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} nrhs - nrhs
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} IPIV - IPIV
* @param {integer} strideIPIV - strideIPIV
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zgesv( N, nrhs, A, LDA, IPIV, strideIPIV, B, LDB ) { // eslint-disable-line max-len, max-params
	var oipiv;
	var sa1;
	var sa2;
	var sb1;
	var sb2;

	sa1 = 1;
	sa2 = LDA;
	sb1 = 1;
	sb2 = LDB;
	oipiv = stride2offset( N, strideIPIV );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	return base( N, nrhs, A, sa1, sa2, 0, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0 );
}


// EXPORTS //

export default zgesv;
