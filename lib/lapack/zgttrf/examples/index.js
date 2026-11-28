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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgttrf from './../lib/index.js';

// Complex tridiagonal matrix A (N = 4) with sub-, main and super-diagonals:
const N = 4;
let DL = new Complex128Array( [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
let d = new Complex128Array( [ 4.0, 0.0, 4.0, 0.0, 4.0, 0.0, 4.0, 0.0 ] );
let DU = new Complex128Array( [ 1.0, -1.0, 1.0, -1.0, 1.0, -1.0 ] );
let DU2 = new Complex128Array( N - 2 );
let IPIV = new Int32Array( N );

// Using the standard interface:
let info = zgttrf( N, DL, 1, d, 1, DU, 1, DU2, 1, IPIV, 1 );
console.log( 'info:', info );
console.log( 'd:', reinterpret( d, 0 ) );
console.log( 'IPIV:', IPIV );

// Using the strided interface:
DL = new Complex128Array( [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
d = new Complex128Array( [ 4.0, 0.0, 4.0, 0.0, 4.0, 0.0, 4.0, 0.0 ] );
DU = new Complex128Array( [ 1.0, -1.0, 1.0, -1.0, 1.0, -1.0 ] );
DU2 = new Complex128Array( N - 2 );
IPIV = new Int32Array( N );
info = zgttrf.strided( N, DL, 1, 0, d, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
console.log( 'info:', info );
console.log( 'd:', reinterpret( d, 0 ) );
console.log( 'IPIV:', IPIV );
