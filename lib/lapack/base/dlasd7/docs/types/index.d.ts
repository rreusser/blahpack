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

/**
* Interface describing `dlasd7`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param icompq - `icompq`
	* @param nl - `nl`
	* @param nr - `nr`
	* @param sqre - `sqre`
	* @param d - `d`
	* @param z - `z`
	* @param ZW - `ZW`
	* @param VF - `VF`
	* @param VFW - `VFW`
	* @param VL - `VL`
	* @param VLW - `VLW`
	* @param alpha - scalar constant
	* @param beta - scalar constant
	* @param DSIGMA - `DSIGMA`
	* @param IDX - `IDX`
	* @param IDXP - `IDXP`
	* @param IDXQ - `IDXQ`
	* @param PERM - `PERM`
	* @param GIVCOL - `GIVCOL`
	* @param LDGCOL - leading dimension of `GCOL`
	* @param GIVNUM - `GIVNUM`
	* @param LDGNUM - leading dimension of `GNUM`
	* @returns result
	*/
	( icompq: number, nl: number, nr: number, sqre: number, d: Float64Array, z: Float64Array, ZW: Float64Array, VF: Float64Array, VFW: Float64Array, VL: Float64Array, VLW: Float64Array, alpha: number, beta: number, DSIGMA: Float64Array, IDX: Int32Array, IDXP: Int32Array, IDXQ: Int32Array, PERM: Int32Array, GIVCOL: Int32Array, LDGCOL: number, GIVNUM: Float64Array, LDGNUM: number ): Record<string, unknown>;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param icompq - `icompq`
	* @param nl - `nl`
	* @param nr - `nr`
	* @param sqre - `sqre`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param z - `z`
	* @param strideZ - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param ZW - `ZW`
	* @param strideZW - stride of `ZW`
	* @param offsetZW - starting index for `ZW`
	* @param VF - `VF`
	* @param strideVF - stride of `VF`
	* @param offsetVF - starting index for `VF`
	* @param VFW - `VFW`
	* @param strideVFW - stride of `VFW`
	* @param offsetVFW - starting index for `VFW`
	* @param VL - `VL`
	* @param strideVL - stride of `VL`
	* @param offsetVL - starting index for `VL`
	* @param VLW - `VLW`
	* @param strideVLW - stride of `VLW`
	* @param offsetVLW - starting index for `VLW`
	* @param alpha - scalar constant
	* @param beta - scalar constant
	* @param DSIGMA - `DSIGMA`
	* @param strideDSIGMA - stride of `DSIGMA`
	* @param offsetDSIGMA - starting index for `DSIGMA`
	* @param IDX - `IDX`
	* @param strideIDX - stride of `IDX`
	* @param offsetIDX - starting index for `IDX`
	* @param IDXP - `IDXP`
	* @param strideIDXP - stride of `IDXP`
	* @param offsetIDXP - starting index for `IDXP`
	* @param IDXQ - `IDXQ`
	* @param strideIDXQ - stride of `IDXQ`
	* @param offsetIDXQ - starting index for `IDXQ`
	* @param PERM - `PERM`
	* @param stridePERM - stride of `PERM`
	* @param offsetPERM - starting index for `PERM`
	* @param GIVCOL - `GIVCOL`
	* @param strideGIVCOL1 - stride of `GIVCOL`
	* @param strideGIVCOL2 - stride of `GIVCOL`
	* @param offsetGIVCOL - starting index for `GIVCOL`
	* @param GIVNUM - `GIVNUM`
	* @param strideGIVNUM1 - stride of `GIVNUM`
	* @param strideGIVNUM2 - stride of `GIVNUM`
	* @param offsetGIVNUM - starting index for `GIVNUM`
	* @returns result
	*/
	ndarray( icompq: number, nl: number, nr: number, sqre: number, d: Float64Array, strideD: number, offsetD: number, z: Float64Array, strideZ: number, offsetZ: number, ZW: Float64Array, strideZW: number, offsetZW: number, VF: Float64Array, strideVF: number, offsetVF: number, VFW: Float64Array, strideVFW: number, offsetVFW: number, VL: Float64Array, strideVL: number, offsetVL: number, VLW: Float64Array, strideVLW: number, offsetVLW: number, alpha: number, beta: number, DSIGMA: Float64Array, strideDSIGMA: number, offsetDSIGMA: number, IDX: Int32Array, strideIDX: number, offsetIDX: number, IDXP: Int32Array, strideIDXP: number, offsetIDXP: number, IDXQ: Int32Array, strideIDXQ: number, offsetIDXQ: number, PERM: Int32Array, stridePERM: number, offsetPERM: number, GIVCOL: Int32Array, strideGIVCOL1: number, strideGIVCOL2: number, offsetGIVCOL: number, GIVNUM: Float64Array, strideGIVNUM1: number, strideGIVNUM2: number, offsetGIVNUM: number ): Record<string, unknown>;
}

/**
* @license MIT.
*/
declare var dlasd7: Routine;


// EXPORTS //

export = dlasd7;
