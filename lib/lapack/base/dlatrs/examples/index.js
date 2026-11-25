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
import dlatrs from './../lib/index.js';

const N = 3;

// Upper triangular 3-by-3 matrix (row-major):
const A = new Float64Array( [ 4.0, 1.0, 2.0, 0.0, 5.0, 3.0, 0.0, 0.0, 6.0 ] );
const b = [ 1.0, 2.0, 3.0 ];

// Using the standard interface:
let x = new Float64Array( b );
let scale = new Float64Array( 1 );
let CNORM = new Float64Array( N );
let info = dlatrs( 'row-major', 'upper', 'no-transpose', 'non-unit', 'no', N, A, N, x, 1, scale, CNORM, 1 );
console.log( info, x, scale );

// Using the ndarray interface:
x = new Float64Array( b );
scale = new Float64Array( 1 );
CNORM = new Float64Array( N );
info = dlatrs.ndarray( 'upper', 'no-transpose', 'non-unit', 'no', N, A, N, 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
console.log( info, x, scale );
