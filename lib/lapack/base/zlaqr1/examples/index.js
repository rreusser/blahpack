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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr1 from './../lib/index.js';

const N = 3;

// 3-by-3 upper Hessenberg matrix (column-major):
const H = new Complex128Array( [ 4.0, 1.0, 1.0, 0.5, 0.0, 0.0, 3.0, -1.0, 2.0, 0.0, 1.0, 1.0, 2.0, 0.5, 1.0, -1.0, 3.0, 0.0 ] );
const s1 = new Complex128( 1.0, 0.5 );
const s2 = new Complex128( 2.0, -0.5 );
const v = new Complex128Array( N );

// Using the standard interface:
zlaqr1( 'column-major', N, H, N, s1, s2, v, 1 );
console.log( reinterpret( v, 0 ) );

// Using the ndarray interface:
zlaqr1.ndarray( N, H, 1, N, 0, s1, s2, v, 1, 0 );
console.log( reinterpret( v, 0 ) );
