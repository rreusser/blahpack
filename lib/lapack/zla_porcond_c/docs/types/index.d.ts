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
* Interface describing `zla_porcond_c`.
*/
interface Routine {
	/**
	* Estimates the infinity norm condition number for a Hermitian positive-definite matrix with inverse-c scaling
	*
	* @param order - storage layout
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param AF - input matrix
	* @param LDAF - leading dimension of `AF`
	* @param c - input array
	* @param strideC - stride length for `c`
	* @param capply - capply
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param RWORK - output array
	* @param strideRWORK - stride length for `RWORK`
	* @returns result
	*/
	( order: Layout, uplo: string, N: number, A: Float64Array, LDA: number, AF: Float64Array, LDAF: number, c: Float64Array, strideC: number, capply: boolean, WORK: Float64Array, strideWORK: number, RWORK: Float64Array, strideRWORK: number ): Float64Array;

	/**
	* Estimates the infinity norm condition number for a Hermitian positive-definite matrix with inverse-c scaling, using alternative indexing semantics.
	*
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param AF - input matrix
	* @param strideAF1 - stride of `AF`
	* @param strideAF2 - stride of `AF`
	* @param offsetAF - starting index for `AF`
	* @param c - input array
	* @param strideC - stride length for `c`
	* @param offsetC - starting index for `C`
	* @param capply - capply
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param RWORK - output array
	* @param strideRWORK - stride length for `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @returns result
	*/
	ndarray( uplo: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, AF: Float64Array, strideAF1: number, strideAF2: number, offsetAF: number, c: Float64Array, strideC: number, offsetC: number, capply: boolean, WORK: Float64Array, strideWORK: number, offsetWORK: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number ): Float64Array;
}

/**
* Estimates the infinity norm condition number for a Hermitian positive-definite matrix with inverse-c scaling
*/
declare var zla_porcond_c: Routine;


// EXPORTS //

export = zla_porcond_c;
