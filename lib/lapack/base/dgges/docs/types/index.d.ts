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
* Interface describing `dgges`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param order - storage layout
	* @param jobvsl - `jobvsl`
	* @param jobvsr - `jobvsr`
	* @param sort - `sort`
	* @param selctg - `selctg`
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param ALPHAR - `ALPHAR`
	* @param ALPHAI - `ALPHAI`
	* @param BETA - `BETA`
	* @param VSL - `VSL`
	* @param LDVSL - leading dimension of `VSL`
	* @param VSR - `VSR`
	* @param LDVSR - leading dimension of `VSR`
	* @param WORK - `WORK`
	* @param BWORK - `BWORK`
	* @returns result
	*/
	( order: Layout, jobvsl: number, jobvsr: number, sort: string, selctg: number, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, ALPHAR: Float64Array, ALPHAI: Float64Array, BETA: Float64Array, VSL: Float64Array, LDVSL: number, VSR: Float64Array, LDVSR: number, WORK: Float64Array, BWORK: Int32Array ): Record<string, unknown>;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param jobvsl - `jobvsl`
	* @param jobvsr - `jobvsr`
	* @param sort - `sort`
	* @param selctg - `selctg`
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param ALPHAR - `ALPHAR`
	* @param strideALPHAR - stride of `ALPHAR`
	* @param offsetALPHAR - starting index for `ALPHAR`
	* @param ALPHAI - `ALPHAI`
	* @param strideALPHAI - stride of `ALPHAI`
	* @param offsetALPHAI - starting index for `ALPHAI`
	* @param BETA - `BETA`
	* @param strideBETA - stride of `BETA`
	* @param offsetBETA - starting index for `BETA`
	* @param VSL - `VSL`
	* @param strideVSL1 - stride of `VSL`
	* @param strideVSL2 - stride of `VSL`
	* @param offsetVSL - starting index for `VSL`
	* @param VSR - `VSR`
	* @param strideVSR1 - stride of `VSR`
	* @param strideVSR2 - stride of `VSR`
	* @param offsetVSR - starting index for `VSR`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param BWORK - `BWORK`
	* @param strideBwork - stride of `Bwork`
	* @param offsetBwork - starting index for `Bwork`
	* @returns result
	*/
	ndarray( jobvsl: number, jobvsr: number, sort: string, selctg: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, ALPHAR: Float64Array, strideALPHAR: number, offsetALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, offsetALPHAI: number, BETA: Float64Array, strideBETA: number, offsetBETA: number, VSL: Float64Array, strideVSL1: number, strideVSL2: number, offsetVSL: number, VSR: Float64Array, strideVSR1: number, strideVSR2: number, offsetVSR: number, WORK: Float64Array, strideWork: number, offsetWork: number, BWORK: Int32Array, strideBwork: number, offsetBwork: number ): Record<string, unknown>;
}

/**
* @license MIT.
*/
declare var dgges: Routine;


// EXPORTS //

export = dgges;
