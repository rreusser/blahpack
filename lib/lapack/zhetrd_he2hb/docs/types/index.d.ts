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
* Interface describing `zhetrd_he2hb`.
*/
interface Routine {
	/**
	* Reduce a complex Hermitian matrix A to complex Hermitian band-diagonal form AB by a unitary similarity transformation: Q^H * A * Q = AB.
	*
	* @param order - storage layout
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param kd - kd
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param AB - input matrix
	* @param LDAB - leading dimension of `AB`
	* @param TAU - input array
	* @param strideTAU - stride length for `TAU`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @returns result
	*/
	( order: Layout, uplo: string, N: number, kd: number, A: Float64Array, LDA: number, AB: Float64Array, LDAB: number, TAU: Float64Array, strideTAU: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Reduce a complex Hermitian matrix A to complex Hermitian band-diagonal form AB by a unitary similarity transformation: Q^H * A * Q = AB., using alternative indexing semantics.
	*
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param kd - kd
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param AB - input matrix
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param TAU - input array
	* @param strideTAU - stride length for `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( uplo: string, N: number, kd: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Reduce a complex Hermitian matrix A to complex Hermitian band-diagonal form AB by a unitary similarity transformation: Q^H * A * Q = AB.
*/
declare var zhetrd_he2hb: Routine;


// EXPORTS //

export = zhetrd_he2hb;
