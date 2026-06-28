
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Merge two sets of singular values in bidiagonal SVD divide and conquer.
*
* @param {integer} nl - nl
* @param {integer} nr - nr
* @param {integer} sqre - sqre
* @param {NonNegativeInteger} K - number of superdiagonals
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} z - input array
* @param {integer} strideZ - stride length for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {number} alpha - scalar constant
* @param {number} beta - scalar constant
* @param {Float64Array} U - input matrix
* @param {integer} strideU1 - stride of the first dimension of `U`
* @param {integer} strideU2 - stride of the second dimension of `U`
* @param {NonNegativeInteger} offsetU - starting index for `U`
* @param {Float64Array} VT - input matrix
* @param {integer} strideVT1 - stride of the first dimension of `VT`
* @param {integer} strideVT2 - stride of the second dimension of `VT`
* @param {NonNegativeInteger} offsetVT - starting index for `VT`
* @param {Float64Array} DSIGMA - input array
* @param {integer} strideDSIGMA - stride length for `DSIGMA`
* @param {NonNegativeInteger} offsetDSIGMA - starting index for `DSIGMA`
* @param {Float64Array} U2 - input matrix
* @param {integer} strideU21 - stride of the first dimension of `U2`
* @param {integer} strideU22 - stride of the second dimension of `U2`
* @param {NonNegativeInteger} offsetU2 - starting index for `U2`
* @param {Float64Array} VT2 - input matrix
* @param {integer} strideVT21 - stride of the first dimension of `VT2`
* @param {integer} strideVT22 - stride of the second dimension of `VT2`
* @param {NonNegativeInteger} offsetVT2 - starting index for `VT2`
* @param {Int32Array} IDXP - input array
* @param {integer} strideIDXP - stride length for `IDXP`
* @param {NonNegativeInteger} offsetIDXP - starting index for `IDXP`
* @param {Int32Array} IDX - input array
* @param {integer} strideIDX - stride length for `IDX`
* @param {NonNegativeInteger} offsetIDX - starting index for `IDX`
* @param {Int32Array} IDXC - input array
* @param {integer} strideIDXC - stride length for `IDXC`
* @param {NonNegativeInteger} offsetIDXC - starting index for `IDXC`
* @param {Int32Array} IDXQ - input array
* @param {integer} strideIDXQ - stride length for `IDXQ`
* @param {NonNegativeInteger} offsetIDXQ - starting index for `IDXQ`
* @param {Int32Array} COLTYP - output array
* @param {integer} strideCOLTYP - stride length for `COLTYP`
* @param {NonNegativeInteger} offsetCOLTYP - starting index for `COLTYP`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dlasd2( nl, nr, sqre, K, d, strideD, offsetD, z, strideZ, offsetZ, alpha, beta, U, strideU1, strideU2, offsetU, VT, strideVT1, strideVT2, offsetVT, DSIGMA, strideDSIGMA, offsetDSIGMA, U2, strideU21, strideU22, offsetU2, VT2, strideVT21, strideVT22, offsetVT2, IDXP, strideIDXP, offsetIDXP, IDX, strideIDX, offsetIDX, IDXC, strideIDXC, offsetIDXC, IDXQ, strideIDXQ, offsetIDXQ, COLTYP, strideCOLTYP, offsetCOLTYP ) { // eslint-disable-line max-len, max-params
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	return base( nl, nr, sqre, K, d, strideD, offsetD, z, strideZ, offsetZ, alpha, beta, U, strideU1, strideU2, offsetU, VT, strideVT1, strideVT2, offsetVT, DSIGMA, strideDSIGMA, offsetDSIGMA, U2, strideU21, strideU22, offsetU2, VT2, strideVT21, strideVT22, offsetVT2, IDXP, strideIDXP, offsetIDXP, IDX, strideIDX, offsetIDX, IDXC, strideIDXC, offsetIDXC, IDXQ, strideIDXQ, offsetIDXQ, COLTYP, strideCOLTYP, offsetCOLTYP ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlasd2;
