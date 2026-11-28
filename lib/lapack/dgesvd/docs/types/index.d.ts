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
* Job specifier for the left singular vectors.
*/
type JobU = 'all-columns' | 'economy' | 'overwrite' | 'none';

/**
* Job specifier for the right singular vectors.
*/
type JobVT = 'all-rows' | 'economy' | 'overwrite' | 'none';

/**
* Interface describing `dgesvd`.
*/
interface Routine {
	/**
	* Computes the singular value decomposition (SVD) of a real M-by-N matrix.
	*
	* @param order - storage layout
	* @param jobu - left singular vector job specifier
	* @param jobvt - right singular vector job specifier
	* @param M - number of rows of `A`
	* @param N - number of columns of `A`
	* @param A - input/output matrix
	* @param LDA - leading dimension of `A`
	* @param s - output array of singular values
	* @param strideS - stride length for `s`
	* @param U - output matrix for the left singular vectors
	* @param LDU - leading dimension of `U`
	* @param VT - output matrix for the right singular vectors (V^T)
	* @param LDVT - leading dimension of `VT`
	* @returns info status code
	*/
	( order: Layout, jobu: JobU, jobvt: JobVT, M: number, N: number, A: Float64Array, LDA: number, s: Float64Array, strideS: number, U: Float64Array, LDU: number, VT: Float64Array, LDVT: number ): number;

	/**
	* Computes the singular value decomposition (SVD) of a real M-by-N matrix using alternative indexing semantics.
	*
	* @param jobu - left singular vector job specifier
	* @param jobvt - right singular vector job specifier
	* @param M - number of rows of `A`
	* @param N - number of columns of `A`
	* @param A - input/output matrix
	* @param strideA1 - stride of dimension 1 of `A`
	* @param strideA2 - stride of dimension 2 of `A`
	* @param offsetA - starting index for `A`
	* @param s - output array of singular values
	* @param strideS - stride length for `s`
	* @param offsetS - starting index for `s`
	* @param U - output matrix for the left singular vectors
	* @param strideU1 - stride of dimension 1 of `U`
	* @param strideU2 - stride of dimension 2 of `U`
	* @param offsetU - starting index for `U`
	* @param VT - output matrix for the right singular vectors (V^T)
	* @param strideVT1 - stride of dimension 1 of `VT`
	* @param strideVT2 - stride of dimension 2 of `VT`
	* @param offsetVT - starting index for `VT`
	* @returns info status code
	*/
	ndarray( jobu: JobU, jobvt: JobVT, M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, s: Float64Array, strideS: number, offsetS: number, U: Float64Array, strideU1: number, strideU2: number, offsetU: number, VT: Float64Array, strideVT1: number, strideVT2: number, offsetVT: number ): number;
}

/**
* Computes the singular value decomposition (SVD) of a real M-by-N matrix.
*/
declare var dgesvd: Routine;


// EXPORTS //

export = dgesvd;
