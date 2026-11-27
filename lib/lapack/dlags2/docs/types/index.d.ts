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
* Interface describing `dlags2`.
*/
interface Routine {
	/**
	* Computes 2-by-2 orthogonal matrices U, V, and Q, such that if UPPER is true:.
	*
	* @param upper - `upper`
	* @param a1 - `a1`
	* @param a2 - `a2`
	* @param a3 - `a3`
	* @param b1 - `b1`
	* @param b2 - `b2`
	* @param b3 - `b3`
	* @returns result
	*/
	( upper: boolean, a1: number, a2: number, a3: number, b1: number, b2: number, b3: number ): void;

	/**
	* Computes 2-by-2 orthogonal matrices U, V, and Q, such that if UPPER is true: using alternative indexing semantics.
	*
	* @param upper - `upper`
	* @param a1 - `a1`
	* @param a2 - `a2`
	* @param a3 - `a3`
	* @param b1 - `b1`
	* @param b2 - `b2`
	* @param b3 - `b3`
	* @param csu - `csu`
	* @param snu - `snu`
	* @param csv - `csv`
	* @param snv - `snv`
	* @param csq - `csq`
	* @param snq - `snq`
	* @returns result
	*/
	ndarray( upper: boolean, a1: number, a2: number, a3: number, b1: number, b2: number, b3: number, csu: number, snu: number, csv: number, snv: number, csq: number, snq: number ): void;
}

/**
* Computes 2-by-2 orthogonal matrices U, V, and Q, such that if UPPER is true:.
*/
declare var dlags2: Routine;


// EXPORTS //

export = dlags2;
