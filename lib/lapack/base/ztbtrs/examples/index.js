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
import ztbtrs from './../lib/index.js';

// Upper triangular band matrix with KD=1, N=3, Dense: [3  1+i  0; 0  4  2; 0  0  5]

var AB = new Complex128Array( [ 0, 0, 3, 0, 1, 1, 4, 0, 2, 0, 5, 0 ] );
var B = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );

var info = ztbtrs( 'column-major', 'upper', 'no-transpose', 'non-unit', 3, 1, 1, AB, 2, B, 3 );
console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'x (re/im pairs):', reinterpret( B, 0 ) ); // eslint-disable-line no-console
