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
* Interface describing `zggbal`.
*/
interface Routine {
	/**
	* CABS1: sum of absolute values of real and imaginary parts.
	*
	* @param order - storage layout
	* @param job - `job`
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param LSCALE - `LSCALE`
	* @param strideLSCALE - stride of `LSCALE`
	* @param RSCALE - `RSCALE`
	* @param strideRSCALE - stride of `RSCALE`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @returns result
	*/
	( order: Layout, job: string, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, LSCALE: Float64Array, strideLSCALE: number, RSCALE: Float64Array, strideRSCALE: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* CABS1: sum of absolute values of real and imaginary parts using alternative indexing semantics.
	*
	* @param job - `job`
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param LSCALE - `LSCALE`
	* @param strideLSCALE - stride of `LSCALE`
	* @param offsetLSCALE - starting index for `LSCALE`
	* @param RSCALE - `RSCALE`
	* @param strideRSCALE - stride of `RSCALE`
	* @param offsetRSCALE - starting index for `RSCALE`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( job: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, LSCALE: Float64Array, strideLSCALE: number, offsetLSCALE: number, RSCALE: Float64Array, strideRSCALE: number, offsetRSCALE: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* CABS1: sum of absolute values of real and imaginary parts.
*/
declare var zggbal: Routine;


// EXPORTS //

export = zggbal;
