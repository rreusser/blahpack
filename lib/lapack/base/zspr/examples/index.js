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
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zspr from './../lib/index.js';

const N = 3;
const alpha = new Complex128( 1.0, 0.0 );
const x = new Complex128Array( [ 1.0, 2.0, -3.0, 0.5, 2.0, -1.0 ] );

// Packed upper triangle of a 3x3 symmetric matrix (N*(N+1)/2 complex elements):
let AP = new Complex128Array( N * ( N + 1 ) / 2 );

// Using the standard interface:
let out = zspr( 'column-major', 'upper', N, alpha, x, 1, AP );
console.log( out );

// Using the ndarray interface:
AP = new Complex128Array( N * ( N + 1 ) / 2 );
out = zspr.ndarray( 'upper', N, alpha, x, 1, 0, AP, 1, 0 );
console.log( out );
