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
	* Executes a single multishift QZ sweep on a matrix pencil.
	*
	* @param order - storage layout
	* @param ilschur - ilschur
	* @param ilq - ilq
	* @param ilz - ilz
	* @param N - number of columns
	* @param ilo - ilo
	* @param ihi - ihi
	* @param nshifts - nshifts
	* @param nblockDesired - nblockDesired
	* @param SR - input array
	* @param strideSR - stride length for `SR`
	* @param SI - input array
	* @param strideSI - stride length for `SI`
	* @param SS - input array
	* @param strideSS - stride length for `SS`
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
	* @param Q - input matrix
	* @param LDQ - leading dimension of `Q`
	* @param Z - input matrix
	* @param LDZ - leading dimension of `Z`
	* @param QC - input matrix
	* @param LDQC - leading dimension of `QC`
	* @param ZC - input matrix
	* @param LDZC - leading dimension of `ZC`
	* @param WORK - output array
	* @returns result
	*/
	( order: Layout, ilschur: boolean, ilq: boolean, ilz: boolean, N: number, ilo: number, ihi: number, nshifts: number, nblockDesired: number, SR: Float64Array, strideSR: number, SI: Float64Array, strideSI: number, SS: Float64Array, strideSS: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, Q: Float64Array, LDQ: number, Z: Float64Array, LDZ: number, QC: Float64Array, LDQC: number, ZC: Float64Array, LDZC: number, WORK: Float64Array ): Float64Array;

	/**
	* Executes a single multishift QZ sweep on a matrix pencil., using alternative indexing semantics.
	*
	* @param ilschur - ilschur
	* @param ilq - ilq
	* @param ilz - ilz
	* @param N - number of columns
	* @param ilo - ilo
	* @param ihi - ihi
	* @param nshifts - nshifts
	* @param nblockDesired - nblockDesired
	* @param SR - input array
	* @param strideSR - stride length for `SR`
	* @param offsetSR - starting index for `SR`
	* @param SI - input array
	* @param strideSI - stride length for `SI`
	* @param offsetSI - starting index for `SI`
	* @param SS - input array
	* @param strideSS - stride length for `SS`
	* @param offsetSS - starting index for `SS`
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param Q - input matrix
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param Z - input matrix
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param QC - input matrix
	* @param strideQC1 - stride of `QC`
	* @param strideQC2 - stride of `QC`
	* @param offsetQC - starting index for `QC`
	* @param ZC - input matrix
	* @param strideZC1 - stride of `ZC`
	* @param strideZC2 - stride of `ZC`
	* @param offsetZC - starting index for `ZC`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( ilschur: boolean, ilq: boolean, ilz: boolean, N: number, ilo: number, ihi: number, nshifts: number, nblockDesired: number, SR: Float64Array, strideSR: number, offsetSR: number, SI: Float64Array, strideSI: number, offsetSI: number, SS: Float64Array, strideSS: number, offsetSS: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, QC: Float64Array, strideQC1: number, strideQC2: number, offsetQC: number, ZC: Float64Array, strideZC1: number, strideZC2: number, offsetZC: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Executes a single multishift QZ sweep on a matrix pencil.
*/
declare var dlaqz4: Routine;


// EXPORTS //

export = dlaqz4;
