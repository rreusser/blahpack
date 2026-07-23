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
* Interface describing `dgsvj0`.
*/
interface Routine {
	/**
	* Pre-processor for dgesvj performing Jacobi rotations.
	*
	* @param order - storage layout
	* @param jobv - `jobv`
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param sva - `sva`
	* @param strideSVA - stride of `SVA`
	* @param mv - `mv`
	* @param V - `V`
	* @param LDV - leading dimension of `V`
	* @param eps - `eps`
	* @param sfmin - `sfmin`
	* @param tol - `tol`
	* @param nsweep - `nsweep`
	* @param work - `work`
	* @param strideWork - stride of `Work`
	* @returns result
	*/
	( order: Layout, jobv: string, M: number, N: number, A: Float64Array, LDA: number, d: Float64Array, strideD: number, sva: Float64Array, strideSVA: number, mv: number, V: Float64Array, LDV: number, eps: number, sfmin: number, tol: number, nsweep: number, work: Float64Array, strideWork: number ): number;

	/**
	* Pre-processor for dgesvj performing Jacobi rotations using alternative indexing semantics.
	*
	* @param jobv - `jobv`
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param sva - `sva`
	* @param strideSVA - stride of `SVA`
	* @param offsetSVA - starting index for `SVA`
	* @param mv - `mv`
	* @param V - `V`
	* @param strideV1 - stride of `V`
	* @param strideV2 - stride of `V`
	* @param offsetV - starting index for `V`
	* @param eps - `eps`
	* @param sfmin - `sfmin`
	* @param tol - `tol`
	* @param nsweep - `nsweep`
	* @param work - `work`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( jobv: string, M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, d: Float64Array, strideD: number, offsetD: number, sva: Float64Array, strideSVA: number, offsetSVA: number, mv: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, eps: number, sfmin: number, tol: number, nsweep: number, work: Float64Array, strideWork: number, offsetWork: number ): number;
}

/**
* Pre-processor for dgesvj performing Jacobi rotations.
*/
declare var dgsvj0: Routine;


// EXPORTS //

export = dgsvj0;
