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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsptrf from './../lib/index.js';

// 3x3 complex symmetric matrix (lower packed):

// [ (4,1)   (2,-1)   (1,2)  ]

// [ (2,-1)  (5,0.5)  (3,-1) ]

// [ (1,2)   (3,-1)   (6,1)  ]
var AP = new Complex128Array( [ 4.0, 1.0, 2.0, -1.0, 1.0, 2.0, 5.0, 0.5, 3.0, -1.0, 6.0, 1.0 ] );
var IPIV = new Int32Array( 3 );

var info = zsptrf( 'lower', 3, AP, IPIV );

console.log( 'info:', info );
console.log( 'AP (factored):', reinterpret( AP, 0 ) );
console.log( 'IPIV:', IPIV );
