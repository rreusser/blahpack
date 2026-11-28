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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpftrf from './../../dpftrf/lib/index.js';
import dpftrs from './../lib/index.js';

// 3x3 symmetric positive definite matrix in RFP format (TRANSR='no-transpose', UPLO='lower'):
const N = 3;
const data = [ 10.0, 3.0, 1.0, 6.0, 8.0, 2.0 ];
const rhs = [ 33.0, 38.0, 32.0 ];

// Using the standard interface (factor A, then solve A * X = B):
let A = new Float64Array( data );
let B = new Float64Array( rhs );
dpftrf( 'no-transpose', 'lower', N, A, 1 );
let info = dpftrs( 'column-major', 'no-transpose', 'lower', N, 1, A, 1, B, N );
console.log( 'info:', info );
// => info: 0
console.log( 'Solution:', B );

// Using the strided interface:
A = new Float64Array( data );
B = new Float64Array( rhs );
dpftrf.strided( 'no-transpose', 'lower', N, A, 1, 0 );
info = dpftrs.strided( 'no-transpose', 'lower', N, 1, A, 1, 0, B, 1, N, 0 );
console.log( 'info:', info );
// => info: 0
console.log( 'Solution:', B );
