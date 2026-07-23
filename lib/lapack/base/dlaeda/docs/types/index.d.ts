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
	* @param tlvls - `tlvls`
	* @param curlvl - `curlvl`
	* @param curpbm - `curpbm`
	* @param PRMPTR - `PRMPTR`
	* @param stridePRMPTR - stride of `PRMPTR`
	* @param offsetPRMPTR - starting index for `PRMPTR`
	* @param PERM - `PERM`
	* @param stridePERM - stride of `PERM`
	* @param offsetPERM - starting index for `PERM`
	* @param GIVPTR - `GIVPTR`
	* @param strideGIVPTR - stride of `GIVPTR`
	* @param offsetGIVPTR - starting index for `GIVPTR`
	* @param GIVCOL - `GIVCOL`
	* @param strideGIVCOL1 - stride of `GIVCOL`
	* @param strideGIVCOL2 - stride of `GIVCOL`
	* @param offsetGIVCOL - starting index for `GIVCOL`
	* @param GIVNUM - `GIVNUM`
	* @param LDGIVNUM - leading dimension of `GIVNUM`
	* @param q - `q`
	* @param strideQ - stride of `Q`
	* @param QPTR - `QPTR`
	* @param strideQPTR - stride of `QPTR`
	* @param offsetQPTR - starting index for `QPTR`
	* @param z - `z`
	* @param strideZ - stride of `Z`
	* @param ZTEMP - `ZTEMP`
	* @param strideZTEMP - stride of `ZTEMP`
	* @returns result
	*/
	( order: Layout, N: number, tlvls: number, curlvl: number, curpbm: number, PRMPTR: Float64Array, stridePRMPTR: number, offsetPRMPTR: number, PERM: Int32Array, stridePERM: number, offsetPERM: number, GIVPTR: Float64Array, strideGIVPTR: number, offsetGIVPTR: number, GIVCOL: Int32Array, strideGIVCOL1: number, strideGIVCOL2: number, offsetGIVCOL: number, GIVNUM: Float64Array, LDGIVNUM: number, q: Float64Array, strideQ: number, QPTR: Float64Array, strideQPTR: number, offsetQPTR: number, z: Float64Array, strideZ: number, ZTEMP: Float64Array, strideZTEMP: number ): number;

	/**
	* Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param tlvls - `tlvls`
	* @param curlvl - `curlvl`
	* @param curpbm - `curpbm`
	* @param PRMPTR - `PRMPTR`
	* @param stridePRMPTR - stride of `PRMPTR`
	* @param offsetPRMPTR - starting index for `PRMPTR`
	* @param PERM - `PERM`
	* @param stridePERM - stride of `PERM`
	* @param offsetPERM - starting index for `PERM`
	* @param GIVPTR - `GIVPTR`
	* @param strideGIVPTR - stride of `GIVPTR`
	* @param offsetGIVPTR - starting index for `GIVPTR`
	* @param GIVCOL - `GIVCOL`
	* @param strideGIVCOL1 - stride of `GIVCOL`
	* @param strideGIVCOL2 - stride of `GIVCOL`
	* @param offsetGIVCOL - starting index for `GIVCOL`
	* @param GIVNUM - `GIVNUM`
	* @param strideGIVNUM1 - stride of `GIVNUM`
	* @param strideGIVNUM2 - stride of `GIVNUM`
	* @param offsetGIVNUM - starting index for `GIVNUM`
	* @param q - `q`
	* @param strideQ - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param QPTR - `QPTR`
	* @param strideQPTR - stride of `QPTR`
	* @param offsetQPTR - starting index for `QPTR`
	* @param z - `z`
	* @param strideZ - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param ZTEMP - `ZTEMP`
	* @param strideZTEMP - stride of `ZTEMP`
	* @param offsetZTEMP - starting index for `ZTEMP`
	* @returns result
	*/
	ndarray( N: number, tlvls: number, curlvl: number, curpbm: number, PRMPTR: Float64Array, stridePRMPTR: number, offsetPRMPTR: number, PERM: Int32Array, stridePERM: number, offsetPERM: number, GIVPTR: Float64Array, strideGIVPTR: number, offsetGIVPTR: number, GIVCOL: Int32Array, strideGIVCOL1: number, strideGIVCOL2: number, offsetGIVCOL: number, GIVNUM: Float64Array, strideGIVNUM1: number, strideGIVNUM2: number, offsetGIVNUM: number, q: Float64Array, strideQ: number, offsetQ: number, QPTR: Float64Array, strideQPTR: number, offsetQPTR: number, z: Float64Array, strideZ: number, offsetZ: number, ZTEMP: Float64Array, strideZTEMP: number, offsetZTEMP: number ): number;
}

/**
* Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC.
*/
declare var dlaeda: Routine;


// EXPORTS //

export = dlaeda;
