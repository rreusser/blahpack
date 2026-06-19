/*
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// TypeScript Version: 4.1

/// <reference types="@stdlib/types"/>

import { Layout } from '@stdlib/types/blas';

/**
* Interface describing `dlaeda`.
*/
interface Routine {
	/**
	* Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC.
	*
	* @param order - storage layout
	* @param N - number of columns
	* @param tlvls - tlvls
	* @param curlvl - curlvl
	* @param curpbm - curpbm
	* @param PRMPTR - input array
	* @param stridePRMPTR - stride length for `PRMPTR`
	* @param offsetPRMPTR - starting index for `PRMPTR`
	* @param PERM - input array
	* @param stridePERM - stride length for `PERM`
	* @param offsetPERM - starting index for `PERM`
	* @param GIVPTR - input array
	* @param strideGIVPTR - stride length for `GIVPTR`
	* @param offsetGIVPTR - starting index for `GIVPTR`
	* @param GIVCOL - input matrix
	* @param strideGIVCOL1 - stride of the first dimension of `GIVCOL`
	* @param strideGIVCOL2 - stride of the second dimension of `GIVCOL`
	* @param offsetGIVCOL - starting index for `GIVCOL`
	* @param GIVNUM - input matrix
	* @param LDGIVNUM - leading dimension of `GIVNUM`
	* @param q - input array
	* @param strideQ - stride length for `q`
	* @param QPTR - input array
	* @param strideQPTR - stride length for `QPTR`
	* @param offsetQPTR - starting index for `QPTR`
	* @param z - input array
	* @param strideZ - stride length for `z`
	* @param ZTEMP - output array
	* @param strideZTEMP - stride length for `ZTEMP`
	* @returns result
	*/
	( order: Layout, N: number, tlvls: number, curlvl: number, curpbm: number, PRMPTR: Int32Array, stridePRMPTR: number, offsetPRMPTR: number, PERM: Int32Array, stridePERM: number, offsetPERM: number, GIVPTR: Int32Array, strideGIVPTR: number, offsetGIVPTR: number, GIVCOL: Int32Array, strideGIVCOL1: number, strideGIVCOL2: number, offsetGIVCOL: number, GIVNUM: Float64Array, LDGIVNUM: number, q: Float64Array, strideQ: number, QPTR: Int32Array, strideQPTR: number, offsetQPTR: number, z: Float64Array, strideZ: number, ZTEMP: Float64Array, strideZTEMP: number ): Float64Array;

	/**
	* Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC., using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param tlvls - tlvls
	* @param curlvl - curlvl
	* @param curpbm - curpbm
	* @param PRMPTR - input array
	* @param stridePRMPTR - stride length for `PRMPTR`
	* @param offsetPRMPTR - starting index for `PRMPTR`
	* @param PERM - input array
	* @param stridePERM - stride length for `PERM`
	* @param offsetPERM - starting index for `PERM`
	* @param GIVPTR - input array
	* @param strideGIVPTR - stride length for `GIVPTR`
	* @param offsetGIVPTR - starting index for `GIVPTR`
	* @param GIVCOL - input matrix
	* @param strideGIVCOL1 - stride of `GIVCOL`
	* @param strideGIVCOL2 - stride of `GIVCOL`
	* @param offsetGIVCOL - starting index for `GIVCOL`
	* @param GIVNUM - input matrix
	* @param strideGIVNUM1 - stride of `GIVNUM`
	* @param strideGIVNUM2 - stride of `GIVNUM`
	* @param offsetGIVNUM - starting index for `GIVNUM`
	* @param q - input array
	* @param strideQ - stride length for `q`
	* @param offsetQ - starting index for `Q`
	* @param QPTR - input array
	* @param strideQPTR - stride length for `QPTR`
	* @param offsetQPTR - starting index for `QPTR`
	* @param z - input array
	* @param strideZ - stride length for `z`
	* @param offsetZ - starting index for `Z`
	* @param ZTEMP - output array
	* @param strideZTEMP - stride length for `ZTEMP`
	* @param offsetZTEMP - starting index for `ZTEMP`
	* @returns result
	*/
	ndarray( N: number, tlvls: number, curlvl: number, curpbm: number, PRMPTR: Int32Array, stridePRMPTR: number, offsetPRMPTR: number, PERM: Int32Array, stridePERM: number, offsetPERM: number, GIVPTR: Int32Array, strideGIVPTR: number, offsetGIVPTR: number, GIVCOL: Int32Array, strideGIVCOL1: number, strideGIVCOL2: number, offsetGIVCOL: number, GIVNUM: Float64Array, strideGIVNUM1: number, strideGIVNUM2: number, offsetGIVNUM: number, q: Float64Array, strideQ: number, offsetQ: number, QPTR: Int32Array, strideQPTR: number, offsetQPTR: number, z: Float64Array, strideZ: number, offsetZ: number, ZTEMP: Float64Array, strideZTEMP: number, offsetZTEMP: number ): Float64Array;
}

/**
* Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC.
*/
declare var dlaeda: Routine;


// EXPORTS //

export = dlaeda;
