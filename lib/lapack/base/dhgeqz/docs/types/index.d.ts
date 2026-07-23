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
* Interface describing `dhgeqz`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param order - storage layout
	* @param job - `job`
	* @param compq - `compq`
	* @param compz - `compz`
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param H - `H`
	* @param LDH - leading dimension of `H`
	* @param T - `T`
	* @param LDT - leading dimension of `T`
	* @param ALPHAR - `ALPHAR`
	* @param strideALPHAR - stride of `ALPHAR`
	* @param ALPHAI - `ALPHAI`
	* @param strideALPHAI - stride of `ALPHAI`
	* @param BETA - `BETA`
	* @param strideBETA - stride of `BETA`
	* @param Q - `Q`
	* @param LDQ - leading dimension of `Q`
	* @param Z - `Z`
	* @param LDZ - leading dimension of `Z`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @returns result
	*/
	( order: Layout, job: string, compq: string, compz: string, N: number, ilo: number, ihi: number, H: Float64Array, LDH: number, T: Float64Array, LDT: number, ALPHAR: Float64Array, strideALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, BETA: Float64Array, strideBETA: number, Q: Float64Array, LDQ: number, Z: Float64Array, LDZ: number, WORK: Float64Array, strideWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param job - `job`
	* @param compq - `compq`
	* @param compz - `compz`
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param H - `H`
	* @param strideH1 - stride of `H`
	* @param strideH2 - stride of `H`
	* @param offsetH - starting index for `H`
	* @param T - `T`
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param ALPHAR - `ALPHAR`
	* @param strideALPHAR - stride of `ALPHAR`
	* @param offsetALPHAR - starting index for `ALPHAR`
	* @param ALPHAI - `ALPHAI`
	* @param strideALPHAI - stride of `ALPHAI`
	* @param offsetALPHAI - starting index for `ALPHAI`
	* @param BETA - `BETA`
	* @param strideBETA - stride of `BETA`
	* @param offsetBETA - starting index for `BETA`
	* @param Q - `Q`
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param Z - `Z`
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( job: string, compq: string, compz: string, N: number, ilo: number, ihi: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, ALPHAR: Float64Array, strideALPHAR: number, offsetALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, offsetALPHAI: number, BETA: Float64Array, strideBETA: number, offsetBETA: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, WORK: Float64Array, strideWork: number, offsetWork: number ): number;
}

/**
* @license MIT.
*/
declare var dhgeqz: Routine;


// EXPORTS //

export = dhgeqz;
