
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - number of columns
* @param {integer} tlvls - tlvls
* @param {integer} curlvl - curlvl
* @param {integer} curpbm - curpbm
* @param {Int32Array} PRMPTR - input array
* @param {integer} stridePRMPTR - stride length for `PRMPTR`
* @param {NonNegativeInteger} offsetPRMPTR - starting index for `PRMPTR`
* @param {Int32Array} PERM - input array
* @param {integer} stridePERM - stride length for `PERM`
* @param {NonNegativeInteger} offsetPERM - starting index for `PERM`
* @param {Int32Array} GIVPTR - input array
* @param {integer} strideGIVPTR - stride length for `GIVPTR`
* @param {NonNegativeInteger} offsetGIVPTR - starting index for `GIVPTR`
* @param {Int32Array} GIVCOL - input matrix
* @param {integer} strideGIVCOL1 - stride of the first dimension of `GIVCOL`
* @param {integer} strideGIVCOL2 - stride of the second dimension of `GIVCOL`
* @param {NonNegativeInteger} offsetGIVCOL - starting index for `GIVCOL`
* @param {Float64Array} GIVNUM - input matrix
* @param {PositiveInteger} LDGIVNUM - leading dimension of `GIVNUM`
* @param {Float64Array} q - input array
* @param {integer} strideQ - stride length for `q`
* @param {Int32Array} QPTR - input array
* @param {integer} strideQPTR - stride length for `QPTR`
* @param {NonNegativeInteger} offsetQPTR - starting index for `QPTR`
* @param {Float64Array} z - input array
* @param {integer} strideZ - stride length for `z`
* @param {Float64Array} ZTEMP - output array
* @param {integer} strideZTEMP - stride length for `ZTEMP`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} `LDGIVNUM` must be greater than or equal to `max(1,N)` for row-major
* @returns {integer} status code (0 = success)
*/
function dlaeda( order, N, tlvls, curlvl, curpbm, PRMPTR, stridePRMPTR, offsetPRMPTR, PERM, stridePERM, offsetPERM, GIVPTR, strideGIVPTR, offsetGIVPTR, GIVCOL, strideGIVCOL1, strideGIVCOL2, offsetGIVCOL, GIVNUM, LDGIVNUM, q, strideQ, QPTR, strideQPTR, offsetQPTR, z, strideZ, ZTEMP, strideZTEMP ) { // eslint-disable-line max-len, max-params
	var sgivnum1;
	var sgivnum2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDGIVNUM < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,N). Value: `%d`.', LDGIVNUM ) );
	}
	if ( order === 'column-major' ) {
		sgivnum1 = 1;
		sgivnum2 = LDGIVNUM;
	} else {
		sgivnum1 = LDGIVNUM;
		sgivnum2 = 1;
	}
	return base( N, tlvls, curlvl, curpbm, PRMPTR, stridePRMPTR, offsetPRMPTR, PERM, stridePERM, offsetPERM, GIVPTR, strideGIVPTR, offsetGIVPTR, GIVCOL, strideGIVCOL1, strideGIVCOL2, offsetGIVCOL, GIVNUM, sgivnum1, sgivnum2, 0, q, strideQ, 0, QPTR, strideQPTR, offsetQPTR, z, strideZ, 0, ZTEMP, strideZTEMP, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaeda;
