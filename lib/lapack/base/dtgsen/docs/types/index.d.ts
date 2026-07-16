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
* Interface describing `dtgsen`.
*/
interface Routine {
	/**
	* Reorders the generalized real Schur decomposition of a real matrix pair
	*
	* @param order - storage layout
	* @param ijob - ijob
	* @param wantq - wantq
	* @param wantz - wantz
	* @param SELECT - input array
	* @param strideSELECT - stride length for `SELECT`
	* @param N - number of columns
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
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
	* @param M - number of rows
	* @param pl - pl
	* @param pr - pr
	* @param DIF - input array
	* @param strideDIF - stride length for `DIF`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	( order: Layout, ijob: number, wantq: boolean, wantz: boolean, SELECT: Float64Array, strideSELECT: number, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, ALPHAR: Float64Array, strideALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, BETA: Float64Array, strideBETA: number, Q: Float64Array, LDQ: number, Z: Float64Array, LDZ: number, M: number, pl: number, pr: number, DIF: Float64Array, strideDIF: number, WORK: Float64Array, strideWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;

	/**
	* Reorders the generalized real Schur decomposition of a real matrix pair, using alternative indexing semantics.
	*
	* @param ijob - ijob
	* @param wantq - wantq
	* @param wantz - wantz
	* @param SELECT - input array
	* @param strideSELECT - stride length for `SELECT`
	* @param offsetSELECT - starting index for `SELECT`
	* @param N - number of columns
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
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
	* @param M - number of rows
	* @param pl - pl
	* @param pr - pr
	* @param DIF - input array
	* @param strideDIF - stride length for `DIF`
	* @param offsetDIF - starting index for `DIF`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( ijob: number, wantq: boolean, wantz: boolean, SELECT: Float64Array, strideSELECT: number, offsetSELECT: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, ALPHAR: Float64Array, strideALPHAR: number, offsetALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, offsetALPHAI: number, BETA: Float64Array, strideBETA: number, offsetBETA: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, M: number, pl: number, pr: number, DIF: Float64Array, strideDIF: number, offsetDIF: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Reorders the generalized real Schur decomposition of a real matrix pair
*/
declare var dtgsen: Routine;


// EXPORTS //

export = dtgsen;
