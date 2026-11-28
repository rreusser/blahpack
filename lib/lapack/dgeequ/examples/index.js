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
import dgeequ from './../lib/index.js';

// Compute row and column scalings to equilibrate a badly scaled 3x3 matrix (column-major):
const M = 3;
const N = 3;
const A = new Float64Array( [ 1.0, 1000.0, 0.001, 2.0, 3000.0, 0.002, 3.0, 1000.0, 0.005 ] );
const r = new Float64Array( M );
const c = new Float64Array( N );
const rowcnd = new Float64Array( 1 );
const colcnd = new Float64Array( 1 );
const amax = new Float64Array( 1 );

// Using the standard interface:
let info = dgeequ( 'column-major', M, N, A, M, r, 1, c, 1, rowcnd, colcnd, amax );
console.log( info, r, c, rowcnd[ 0 ], colcnd[ 0 ], amax[ 0 ] ); // eslint-disable-line no-console

// Using the ndarray interface:
info = dgeequ.ndarray( M, N, A, 1, M, 0, r, 1, 0, c, 1, 0, rowcnd, colcnd, amax );
console.log( info, r, c, rowcnd[ 0 ], colcnd[ 0 ], amax[ 0 ] ); // eslint-disable-line no-console
