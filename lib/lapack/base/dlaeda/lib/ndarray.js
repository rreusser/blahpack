
// MODULES //

import base from './base.js';


// MAIN //

/**
* Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC.
*
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
* @param {integer} strideGIVNUM1 - stride of the first dimension of `GIVNUM`
* @param {integer} strideGIVNUM2 - stride of the second dimension of `GIVNUM`
* @param {NonNegativeInteger} offsetGIVNUM - starting index for `GIVNUM`
* @param {Float64Array} q - input array
* @param {integer} strideQ - stride length for `q`
* @param {NonNegativeInteger} offsetQ - starting index for `q`
* @param {Int32Array} QPTR - input array
* @param {integer} strideQPTR - stride length for `QPTR`
* @param {NonNegativeInteger} offsetQPTR - starting index for `QPTR`
* @param {Float64Array} z - input array
* @param {integer} strideZ - stride length for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {Float64Array} ZTEMP - output array
* @param {integer} strideZTEMP - stride length for `ZTEMP`
* @param {NonNegativeInteger} offsetZTEMP - starting index for `ZTEMP`
* @returns {integer} status code (0 = success)
*/
function dlaeda( N, tlvls, curlvl, curpbm, PRMPTR, stridePRMPTR, offsetPRMPTR, PERM, stridePERM, offsetPERM, GIVPTR, strideGIVPTR, offsetGIVPTR, GIVCOL, strideGIVCOL1, strideGIVCOL2, offsetGIVCOL, GIVNUM, strideGIVNUM1, strideGIVNUM2, offsetGIVNUM, q, strideQ, offsetQ, QPTR, strideQPTR, offsetQPTR, z, strideZ, offsetZ, ZTEMP, strideZTEMP, offsetZTEMP ) { // eslint-disable-line max-len, max-params
	return base( N, tlvls, curlvl, curpbm, PRMPTR, stridePRMPTR, offsetPRMPTR, PERM, stridePERM, offsetPERM, GIVPTR, strideGIVPTR, offsetGIVPTR, GIVCOL, strideGIVCOL1, strideGIVCOL2, offsetGIVCOL, GIVNUM, strideGIVNUM1, strideGIVNUM2, offsetGIVNUM, q, strideQ, offsetQ, QPTR, strideQPTR, offsetQPTR, z, strideZ, offsetZ, ZTEMP, strideZTEMP, offsetZTEMP ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaeda;
