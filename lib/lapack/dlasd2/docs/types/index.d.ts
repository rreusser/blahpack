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
* Interface describing `dlasd2`.
*/
interface Routine {
	/**
	* Merge two sets of singular values in bidiagonal SVD divide and conquer.
	*
	* @param order - storage layout
	* @param NL - `NL`
	* @param NR - `NR`
	* @param SQRE - `SQRE`
	* @param K - inner dimension
	* @param D - `D`
	* @param Z - `Z`
	* @param ALPHA - `ALPHA`
	* @param BETA - `BETA`
	* @param U - `U`
	* @param LDU - leading dimension of `U`
	* @param VT - `VT`
	* @param LDVT - leading dimension of `VT`
	* @param DSIGMA - `DSIGMA`
	* @param U2 - `U2`
	* @param LDU2 - `LDU2`
	* @param VT2 - `VT2`
	* @param LDVT2 - `LDVT2`
	* @param IDXP - `IDXP`
	* @param IDX - `IDX`
	* @param IDXC - `IDXC`
	* @param IDXQ - `IDXQ`
	* @param COLTYP - `COLTYP`
	* @returns result
	*/
	( order: Layout, NL: number, NR: number, SQRE: number, K: number, D: Float64Array, Z: Float64Array, ALPHA: number, BETA: number, U: Float64Array, LDU: number, VT: Float64Array, LDVT: number, DSIGMA: Float64Array, U2: Float64Array, LDU2: number, VT2: Float64Array, LDVT2: number, IDXP: Int32Array, IDX: Int32Array, IDXC: Int32Array, IDXQ: Int32Array, COLTYP: Float64Array ): Float64Array;

	/**
	* Merge two sets of singular values in bidiagonal SVD divide and conquer using alternative indexing semantics.
	*
	* @param nl - `nl`
	* @param nr - `nr`
	* @param sqre - `sqre`
	* @param K - inner dimension
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param z - `z`
	* @param strideZ - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param alpha - scalar constant
	* @param beta - scalar constant
	* @param U - `U`
	* @param strideU1 - stride of `U`
	* @param strideU2 - stride of `U`
	* @param offsetU - starting index for `U`
	* @param VT - `VT`
	* @param strideVT1 - stride of `VT`
	* @param strideVT2 - stride of `VT`
	* @param offsetVT - starting index for `VT`
	* @param DSIGMA - `DSIGMA`
	* @param strideDSIGMA - stride of `DSIGMA`
	* @param offsetDSIGMA - starting index for `DSIGMA`
	* @param U2 - `U2`
	* @param strideU21 - stride of `U2`
	* @param strideU22 - stride of `U2`
	* @param offsetU2 - starting index for `U2`
	* @param VT2 - `VT2`
	* @param strideVT21 - stride of `VT2`
	* @param strideVT22 - stride of `VT2`
	* @param offsetVT2 - starting index for `VT2`
	* @param IDXP - `IDXP`
	* @param strideIDXP - stride of `IDXP`
	* @param offsetIDXP - starting index for `IDXP`
	* @param IDX - `IDX`
	* @param strideIDX - stride of `IDX`
	* @param offsetIDX - starting index for `IDX`
	* @param IDXC - `IDXC`
	* @param strideIDXC - stride of `IDXC`
	* @param offsetIDXC - starting index for `IDXC`
	* @param IDXQ - `IDXQ`
	* @param strideIDXQ - stride of `IDXQ`
	* @param offsetIDXQ - starting index for `IDXQ`
	* @param COLTYP - `COLTYP`
	* @param strideCOLTYP - stride of `COLTYP`
	* @param offsetCOLTYP - starting index for `COLTYP`
	* @returns result
	*/
	ndarray( nl: number, nr: number, sqre: number, K: number, d: Float64Array, strideD: number, offsetD: number, z: Float64Array, strideZ: number, offsetZ: number, alpha: number, beta: number, U: Float64Array, strideU1: number, strideU2: number, offsetU: number, VT: Float64Array, strideVT1: number, strideVT2: number, offsetVT: number, DSIGMA: Float64Array, strideDSIGMA: number, offsetDSIGMA: number, U2: Float64Array, strideU21: number, strideU22: number, offsetU2: number, VT2: Float64Array, strideVT21: number, strideVT22: number, offsetVT2: number, IDXP: Int32Array, strideIDXP: number, offsetIDXP: number, IDX: Int32Array, strideIDX: number, offsetIDX: number, IDXC: Int32Array, strideIDXC: number, offsetIDXC: number, IDXQ: Int32Array, strideIDXQ: number, offsetIDXQ: number, COLTYP: Float64Array, strideCOLTYP: number, offsetCOLTYP: number ): Float64Array;
}

/**
* Merge two sets of singular values in bidiagonal SVD divide and conquer.
*/
declare var dlasd2: Routine;


// EXPORTS //

export = dlasd2;
