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
	* Computes the eigenvalues of a real matrix pair (H,T) where H is upper Hessenberg and T is upper triangular, using the QZ method.
	*
	* @param order - storage layout
	* @param job - specifies the operation type
	* @param compq - specifies the operation type
	* @param compz - specifies the operation type
	* @param N - number of columns
	* @param ilo - ilo
	* @param ihi - ihi
	* @param H - input matrix
	* @param LDH - leading dimension of `H`
	* @param T - input matrix
	* @param LDT - leading dimension of `T`
	* @param ALPHAR - input array
	* @param strideALPHAR - stride length for `ALPHAR`
	* @param ALPHAI - input array
	* @param strideALPHAI - stride length for `ALPHAI`
	* @param BETA - input array
	* @param strideBETA - stride length for `BETA`
	* @param Q - input matrix
	* @param LDQ - leading dimension of `Q`
	* @param Z - input matrix
	* @param LDZ - leading dimension of `Z`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @returns result
	*/
	( order: Layout, job: string, compq: string, compz: string, N: number, ilo: number, ihi: number, H: Float64Array, LDH: number, T: Float64Array, LDT: number, ALPHAR: Float64Array, strideALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, BETA: Float64Array, strideBETA: number, Q: Float64Array, LDQ: number, Z: Float64Array, LDZ: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Computes the eigenvalues of a real matrix pair (H,T) where H is upper Hessenberg and T is upper triangular, using the QZ method., using alternative indexing semantics.
	*
	* @param job - specifies the operation type
	* @param compq - specifies the operation type
	* @param compz - specifies the operation type
	* @param N - number of columns
	* @param ilo - ilo
	* @param ihi - ihi
	* @param H - input matrix
	* @param strideH1 - stride of `H`
	* @param strideH2 - stride of `H`
	* @param offsetH - starting index for `H`
	* @param T - input matrix
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param ALPHAR - input array
	* @param strideALPHAR - stride length for `ALPHAR`
	* @param offsetALPHAR - starting index for `ALPHAR`
	* @param ALPHAI - input array
	* @param strideALPHAI - stride length for `ALPHAI`
	* @param offsetALPHAI - starting index for `ALPHAI`
	* @param BETA - input array
	* @param strideBETA - stride length for `BETA`
	* @param offsetBETA - starting index for `BETA`
	* @param Q - input matrix
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param Z - input matrix
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( job: string, compq: string, compz: string, N: number, ilo: number, ihi: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, ALPHAR: Float64Array, strideALPHAR: number, offsetALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, offsetALPHAI: number, BETA: Float64Array, strideBETA: number, offsetBETA: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Computes the eigenvalues of a real matrix pair (H,T) where H is upper Hessenberg and T is upper triangular, using the QZ method.
*/
declare var dhgeqz: Routine;


// EXPORTS //

export = dhgeqz;
