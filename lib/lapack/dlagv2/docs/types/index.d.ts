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

/**
* Interface describing `dlagv2`.
*/
interface Routine {
	/**
	* Computes the Generalized Schur factorization of a real 2-by-2 matrix pencil (A,B) where B is upper triangular.
	*
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param alphar - `alphar`
	* @param alphai - `alphai`
	* @param beta - scalar constant
	* @returns result
	*/
	( A: Float64Array, LDA: number, B: Float64Array, LDB: number, alphar: Float64Array, alphai: Float64Array, beta: Float64Array ): Float64Array;

	/**
	* Computes the Generalized Schur factorization of a real 2-by-2 matrix pencil (A,B) where B is upper triangular using alternative indexing semantics.
	*
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param alphar - `alphar`
	* @param strideALPHAR - stride of `ALPHAR`
	* @param offsetALPHAR - starting index for `ALPHAR`
	* @param alphai - `alphai`
	* @param strideALPHAI - stride of `ALPHAI`
	* @param offsetALPHAI - starting index for `ALPHAI`
	* @param beta - scalar constant
	* @param strideBETA - stride of `BETA`
	* @param offsetBETA - starting index for `BETA`
	* @returns result
	*/
	ndarray( A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, alphar: Float64Array, strideALPHAR: number, offsetALPHAR: number, alphai: Float64Array, strideALPHAI: number, offsetALPHAI: number, beta: Float64Array, strideBETA: number, offsetBETA: number ): Float64Array;
}

/**
* Computes the Generalized Schur factorization of a real 2-by-2 matrix pencil (A,B) where B is upper triangular.
*/
declare var dlagv2: Routine;


// EXPORTS //

export = dlagv2;
