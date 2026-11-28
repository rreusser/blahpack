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
* Interface describing `iparmq`.
*/
interface Routine {
	/**
	* Returns the tuning parameters of the multishift QR algorithm.
	*
	* @param ispec - parameter to return: `12` (`INMIN`, the order below which `xLAHQR` is used), `13` (`INWIN`, the deflation window size), `14` (`INIBL`, the nibble crossover point), `15` (`ISHFTS`, the number of simultaneous shifts), `16` (`IACC22`, how to accumulate reflections), `17` (`ICOST`, the relative cost of flops); any other value returns `-1`
	* @param name - name of the calling routine (e.g. `'DLAQR0'`), read only for `ispec = 16`; upper-cased, as in the reference, only when its first character is a lower-case letter
	* @param opts - character options of the calling routine (not read)
	* @param N - order of the Hessenberg matrix
	* @param ilo - first row/column of the active block (1-based, as the reference's `ILO`)
	* @param ihi - last row/column of the active block (1-based, as the reference's `IHI`)
	* @returns parameter value
	*
	* @example
	* var v = iparmq( 15, 'DLAQR0', 'SV', 200, 1, 200 );
	* // returns 24
	*/
	( ispec: number, name: string, opts: string, N: number, ilo: number, ihi: number ): number;

	/**
	* Returns the tuning parameters of the multishift QR algorithm, using alternative indexing semantics.
	*
	* @param ispec - parameter to return: `12` (`INMIN`, the order below which `xLAHQR` is used), `13` (`INWIN`, the deflation window size), `14` (`INIBL`, the nibble crossover point), `15` (`ISHFTS`, the number of simultaneous shifts), `16` (`IACC22`, how to accumulate reflections), `17` (`ICOST`, the relative cost of flops); any other value returns `-1`
	* @param name - name of the calling routine (e.g. `'DLAQR0'`), read only for `ispec = 16`; upper-cased, as in the reference, only when its first character is a lower-case letter
	* @param opts - character options of the calling routine (not read)
	* @param N - order of the Hessenberg matrix
	* @param ilo - first row/column of the active block (1-based, as the reference's `ILO`)
	* @param ihi - last row/column of the active block (1-based, as the reference's `IHI`)
	* @returns parameter value
	*
	* @example
	* var v = iparmq.strided( 15, 'DLAQR0', 'SV', 200, 1, 200 );
	* // returns 24
	*/
	strided( ispec: number, name: string, opts: string, N: number, ilo: number, ihi: number ): number;
}

/**
* Returns the tuning parameters of the multishift QR algorithm.
*
* @param ispec - parameter to return: `12` (`INMIN`, the order below which `xLAHQR` is used), `13` (`INWIN`, the deflation window size), `14` (`INIBL`, the nibble crossover point), `15` (`ISHFTS`, the number of simultaneous shifts), `16` (`IACC22`, how to accumulate reflections), `17` (`ICOST`, the relative cost of flops); any other value returns `-1`
* @param name - name of the calling routine (e.g. `'DLAQR0'`), read only for `ispec = 16`; upper-cased, as in the reference, only when its first character is a lower-case letter
* @param opts - character options of the calling routine (not read)
* @param N - order of the Hessenberg matrix
* @param ilo - first row/column of the active block (1-based, as the reference's `ILO`)
* @param ihi - last row/column of the active block (1-based, as the reference's `IHI`)
* @returns parameter value
*
* @example
* var v = iparmq( 15, 'DLAQR0', 'SV', 200, 1, 200 );
* // returns 24
*/
declare var iparmq: Routine;


// EXPORTS //

export = iparmq;
