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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlatbs from './../lib/index.js';

const N = 3;
const kd = 1;

// Upper triangular band matrix with one superdiagonal, stored in band form ((kd+1)-by-N, column-major, interleaved re/im):
const AB = new Complex128Array( [ 0.0, 0.0, 4.0, 1.0, 1.0, -1.0, 5.0, 0.0, 2.0, 1.0, 6.0, -2.0 ] );
const b = [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0 ];

// Using the standard interface:
let x = new Complex128Array( b );
let scale = new Float64Array( 1 );
let CNORM = new Float64Array( N );
let info = zlatbs( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', N, kd, AB, kd + 1, x, 1, scale, CNORM, 1 );
console.log( info, x, scale );

// Using the strided interface:
x = new Complex128Array( b );
scale = new Float64Array( 1 );
CNORM = new Float64Array( N );
info = zlatbs.strided( 'upper', 'no-transpose', 'non-unit', 'no', N, kd, AB, 1, kd + 1, 0, x, 1, 0, scale, CNORM, 1, 0 );
console.log( info, x, scale );
