/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlahqr from './../lib/index.js';

const N = 3;

/**
* Returns a 3x3 complex upper Hessenberg matrix (column-major).
*
* @private
* @returns {Complex128Array} matrix
*/
function hessenberg() {
	return new Complex128Array([
		1.0, 1.0, 4.0, 0.0, 0.0, 0.0,
		2.0, -1.0, 5.0, 2.0, 7.0, 0.0,
		3.0, 0.0, 6.0, -1.0, 8.0, 1.0
	]);
}

/**
* Returns a 3x3 complex identity matrix.
*
* @private
* @returns {Complex128Array} matrix
*/
function identity() {
	return new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
}

const W = new Complex128Array( N );

// Using the standard interface (ILO, IHI, ILOZ and IHIZ are 1-based):
let H = hessenberg();
let Z = identity();
let info = zlahqr( 'column-major', true, true, N, 1, N, H, N, W, 1, 1, N, Z, N );
console.log( 'info = %d', info );
console.log( reinterpret( W, 0 ) );

// Using the ndarray interface:
H = hessenberg();
Z = identity();
info = zlahqr.ndarray( true, true, N, 1, N, H, 1, N, 0, W, 1, 0, 1, N, Z, 1, N, 0 );
console.log( 'info = %d', info );
console.log( reinterpret( W, 0 ) );
