/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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
import zhpsv from './../lib/index.js';

/*
* 3x3 Hermitian matrix (upper packed):
* [ 4       1+2i    2-i  ]
* [ 1-2i    5       3+i  ]
* [ 2+i     3-i     6    ]
*/
var AP = new Complex128Array( [ 4, 0, 1, 2, 5, 0, 2, -1, 3, 1, 6, 0 ] );

// Right-hand side b:
var B = new Complex128Array( [ 1, 0, 0, 1, 1, -1 ] );
var IPIV = new Int32Array( 3 );

var info = zhpsv( 'upper', 3, 1, AP, IPIV, B, 3 );

console.log( 'info: %d', info );
console.log( 'x (interleaved re/im):', reinterpret( B, 0 ) );
console.log( 'IPIV:', IPIV );
