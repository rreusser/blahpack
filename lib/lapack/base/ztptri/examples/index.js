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
import ztptri from './../lib/index.js';

// 2x2 upper triangular: A = [ (2,1) (1,0); (0,0) (3,-1) ]

// Packed column-major: [ (2,1), (1,0), (3,-1) ]
var AP = new Complex128Array( [ 2.0, 1.0, 1.0, 0.0, 3.0, -1.0 ] );

var info = ztptri( 'upper', 'non-unit', 2, AP );
console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'inverse (packed, interleaved re/im):', reinterpret( AP, 0 ) ); // eslint-disable-line no-console
