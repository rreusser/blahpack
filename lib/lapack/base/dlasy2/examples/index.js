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
import dlasy2 from './../lib/index.js';

// Solve TL*X + X*TR = scale*B for 2-by-2 TL, TR and B (column-major):
const N = 2;
const TL = new Float64Array( [ 4.0, 1.0, 2.0, 3.0 ] );
const TR = new Float64Array( [ 2.0, 0.0, 1.0, 5.0 ] );
const B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );

// Using the standard interface:
let X = new Float64Array( N * N );
let scale = new Float64Array( 1 );
let xnorm = new Float64Array( 1 );
let info = dlasy2( 'column-major', false, false, 1, N, N, TL, N, TR, N, B, N, scale, X, N, xnorm );
console.log( info, X, scale, xnorm );

// Using the ndarray interface:
X = new Float64Array( N * N );
scale = new Float64Array( 1 );
xnorm = new Float64Array( 1 );
info = dlasy2.ndarray( false, false, 1, N, N, TL, 1, N, 0, TR, 1, N, 0, B, 1, N, 0, scale, X, 1, N, 0, xnorm );
console.log( info, X, scale, xnorm );
