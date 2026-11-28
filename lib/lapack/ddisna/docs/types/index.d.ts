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



/**
* Interface describing `ddisna`.
*/
interface Routine {
	/**
	* Compute the reciprocal condition numbers for the eigenvectors of a real symmetric or complex Hermitian matrix
	*
	* @param job - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param SEP - output array
	* @param strideSEP - stride length for `SEP`
	* @returns result
	*/
	( job: string, M: number, N: number, d: Float64Array, strideD: number, SEP: Float64Array, strideSEP: number ): Float64Array;

	/**
	* Compute the reciprocal condition numbers for the eigenvectors of a real symmetric or complex Hermitian matrix, using alternative indexing semantics.
	*
	* @param job - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param offsetD - starting index for `D`
	* @param SEP - output array
	* @param strideSEP - stride length for `SEP`
	* @param offsetSEP - starting index for `SEP`
	* @returns result
	*/
	ndarray( job: string, M: number, N: number, d: Float64Array, strideD: number, offsetD: number, SEP: Float64Array, strideSEP: number, offsetSEP: number ): Float64Array;
}

/**
* Compute the reciprocal condition numbers for the eigenvectors of a real symmetric or complex Hermitian matrix
*/
declare var ddisna: Routine;


// EXPORTS //

export = ddisna;
