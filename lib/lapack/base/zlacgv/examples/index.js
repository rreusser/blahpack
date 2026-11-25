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
import zlacgv from './../lib/index.js';

const N = 3;

// Using the standard interface:
let x = new Complex128Array( [ 1.0, 2.0, 3.0, -4.0, 5.0, 6.0 ] );
zlacgv( N, x, 1 );
console.log( reinterpret( x, 0 ) ); // eslint-disable-line no-console

// Using the ndarray interface (conjugate every other element, starting at the second):
x = new Complex128Array( [ 1.0, 2.0, 3.0, -4.0, 5.0, 6.0, 7.0, 8.0 ] );
zlacgv.ndarray( 2, x, 2, 1 );
console.log( reinterpret( x, 0 ) ); // eslint-disable-line no-console
