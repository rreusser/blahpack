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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dtrevc3 from './../lib/index.js';

// Upper triangular matrix T in Schur canonical form (column-major):
const N = 3;
const T = new Float64Array( [ 1.0, 0.0, 0.0, 2.0, 3.0, 0.0, 4.0, 5.0, 6.0 ] );
const SELECT = new Uint8Array( N );
const M = new Int32Array( 1 );
const WORK = new Float64Array( 3 * N );

// Using the standard interface (compute all right eigenvectors):
let VL = new Float64Array( N * N );
let VR = new Float64Array( N * N );
let info = dtrevc3( 'column-major', 'right', 'all', SELECT, 1, N, T, N, VL, N, VR, N, N, M, WORK );
console.log( info, M[ 0 ], VR );

// Using the ndarray interface:
VL = new Float64Array( N * N );
VR = new Float64Array( N * N );
info = dtrevc3.ndarray( 'right', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, M, WORK, 1, 0 );
console.log( info, M[ 0 ], VR );
