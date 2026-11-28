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
* Interface describing `dlarmm`.
*/
interface Routine {
	/**
	* Compute a safe BLAS-style constant for scaling matrix norms
	*
	* @param anorm - anorm
	* @param bnorm - bnorm
	* @param cnorm - cnorm
	* @returns result
	*/
	( anorm: number, bnorm: number, cnorm: number ): number;

	/**
	* Compute a safe BLAS-style constant for scaling matrix norms, using alternative indexing semantics.
	*
	* @param anorm - anorm
	* @param bnorm - bnorm
	* @param cnorm - cnorm
	* @returns result
	*/
	ndarray( anorm: number, bnorm: number, cnorm: number ): number;
}

/**
* Compute a safe BLAS-style constant for scaling matrix norms
*/
declare var dlarmm: Routine;


// EXPORTS //

export = dlarmm;
