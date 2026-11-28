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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlapmr from './../lib/index.js';

const N = 3;
const X = new Complex128Array( [ 1.0, 0.1, 2.0, 0.2, 3.0, 0.3, 4.0, 0.4, 5.0, 0.5, 6.0, 0.6, 7.0, 0.7, 8.0, 0.8, 9.0, 0.9 ] );

// Permutation vector (0-based):
const k = new Int32Array( [ 2, 0, 1 ] );

// Using the standard interface:
zlapmr( 'column-major', true, N, N, X, N, k, 1 );
console.log( reinterpret( X, 0 ) );

// Using the strided interface (undo the permutation):
zlapmr.strided( false, N, N, X, 1, N, 0, k, 1, 0 );
console.log( reinterpret( X, 0 ) );
