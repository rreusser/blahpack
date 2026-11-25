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
import zlarf from './../lib/index.js';

const N = 3;

// Householder vector (first element is 1) and scalar factor:
const v = new Complex128Array( [ 1.0, 0.0, 0.5, -0.5, -0.25, 0.75 ] );
const tau = new Complex128Array( [ 1.2, -0.3 ] );

// 3-by-3 matrix (column-major) and workspace:
let C = new Complex128Array( [ 1.0, 2.0, 3.0, -1.0, 0.5, 0.0, -2.0, 1.0, 4.0, 0.5, 1.0, -1.5, 0.0, 3.0, 2.0, 2.0, -1.0, -1.0 ] );
const WORK = new Complex128Array( N );

// Using the standard interface (C := H * C):
zlarf( 'column-major', 'left', N, N, v, 1, tau, C, N, WORK );
console.log( reinterpret( C, 0 ) );

// Using the ndarray interface:
C = new Complex128Array( [ 1.0, 2.0, 3.0, -1.0, 0.5, 0.0, -2.0, 1.0, 4.0, 0.5, 1.0, -1.5, 0.0, 3.0, 2.0, 2.0, -1.0, -1.0 ] );
zlarf.ndarray( 'left', N, N, v, 1, 0, tau, 0, C, 1, N, 0, WORK, 1, 0 );
console.log( reinterpret( C, 0 ) );
