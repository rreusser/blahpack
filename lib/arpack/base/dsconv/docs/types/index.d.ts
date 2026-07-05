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
* Interface describing `dsconv`.
*/
interface Routine {
	/**
	* Counts the number of "converged" Ritz values for the symmetric Lanczos/Arnoldi eigenvalue iteration.
	*
	* @param N - number of Ritz values to check for convergence
	* @param ritz - Ritz values to be checked for convergence
	* @param strideRITZ - stride length for `ritz`
	* @param bounds - Ritz estimates associated with the Ritz values in `ritz`
	* @param strideBOUNDS - stride length for `bounds`
	* @param tol - desired relative accuracy for a Ritz value to be considered "converged"
	* @returns number of "converged" Ritz values
	*/
	( N: number, ritz: Float64Array, strideRITZ: number, bounds: Float64Array, strideBOUNDS: number, tol: number ): number;

	/**
	* Counts the number of "converged" Ritz values for the symmetric Lanczos/Arnoldi eigenvalue iteration, using alternative indexing semantics.
	*
	* @param N - number of Ritz values to check for convergence
	* @param ritz - Ritz values to be checked for convergence
	* @param strideRITZ - stride length for `ritz`
	* @param offsetRITZ - starting index for `ritz`
	* @param bounds - Ritz estimates associated with the Ritz values in `ritz`
	* @param strideBOUNDS - stride length for `bounds`
	* @param offsetBOUNDS - starting index for `bounds`
	* @param tol - desired relative accuracy for a Ritz value to be considered "converged"
	* @returns number of "converged" Ritz values
	*/
	ndarray( N: number, ritz: Float64Array, strideRITZ: number, offsetRITZ: number, bounds: Float64Array, strideBOUNDS: number, offsetBOUNDS: number, tol: number ): number;
}

/**
* Convergence test for the symmetric Lanczos/Arnoldi eigenvalue iteration.
*/
declare var dsconv: Routine;


// EXPORTS //

export = dsconv;
