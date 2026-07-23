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
* Interface describing `dlaqz4`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param order - storage layout
	* @param ilschur - `ilschur`
	* @param ilq - `ilq`
	* @param ilz - `ilz`
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param nshifts - `nshifts`
	* @param nblockDesired - `nblockDesired`
	* @param SR - `SR`
	* @param strideSR - stride of `SR`
	* @param SI - `SI`
	* @param strideSI - stride of `SI`
	* @param SS - `SS`
	* @param strideSS - stride of `SS`
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param Q - `Q`
	* @param LDQ - leading dimension of `Q`
	* @param Z - `Z`
	* @param LDZ - leading dimension of `Z`
	* @param QC - `QC`
	* @param LDQC - leading dimension of `QC`
	* @param ZC - `ZC`
	* @param LDZC - leading dimension of `ZC`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @returns result
	*/
	( order: Layout, ilschur: number, ilq: number, ilz: number, N: number, ilo: number, ihi: number, nshifts: number, nblockDesired: number, SR: Float64Array, strideSR: number, SI: Float64Array, strideSI: number, SS: Float64Array, strideSS: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, Q: Float64Array, LDQ: number, Z: Float64Array, LDZ: number, QC: Float64Array, LDQC: number, ZC: Float64Array, LDZC: number, WORK: Float64Array, strideWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param ilschur - `ilschur`
	* @param ilq - `ilq`
	* @param ilz - `ilz`
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param nshifts - `nshifts`
	* @param nblockDesired - `nblockDesired`
	* @param SR - `SR`
	* @param strideSR - stride of `SR`
	* @param offsetSR - starting index for `SR`
	* @param SI - `SI`
	* @param strideSI - stride of `SI`
	* @param offsetSI - starting index for `SI`
	* @param SS - `SS`
	* @param strideSS - stride of `SS`
	* @param offsetSS - starting index for `SS`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param Q - `Q`
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param Z - `Z`
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param QC - `QC`
	* @param strideQC1 - stride of `QC`
	* @param strideQC2 - stride of `QC`
	* @param offsetQC - starting index for `QC`
	* @param ZC - `ZC`
	* @param strideZC1 - stride of `ZC`
	* @param strideZC2 - stride of `ZC`
	* @param offsetZC - starting index for `ZC`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( ilschur: number, ilq: number, ilz: number, N: number, ilo: number, ihi: number, nshifts: number, nblockDesired: number, SR: Float64Array, strideSR: number, offsetSR: number, SI: Float64Array, strideSI: number, offsetSI: number, SS: Float64Array, strideSS: number, offsetSS: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, QC: Float64Array, strideQC1: number, strideQC2: number, offsetQC: number, ZC: Float64Array, strideZC1: number, strideZC2: number, offsetZC: number, WORK: Float64Array, strideWork: number, offsetWork: number ): number;
}

/**
* @license MIT.
*/
declare var dlaqz4: Routine;


// EXPORTS //

export = dlaqz4;
