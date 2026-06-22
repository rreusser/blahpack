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
import zgeqrt3 from './../lib/index.js';

// 4x2 complex matrix in column-major order; T is N-by-N = 2-by-2.
var A = new Complex128Array( 8 );
var T = new Complex128Array( 4 );
var info;

A.set( [ 2.0, 0.1 ], 0 );
A.set( [ 0.7, -0.3 ], 1 );
A.set( [ 0.5, 0.3 ], 2 );
A.set( [ -1.0, 0.4 ], 3 );
A.set( [ 1.5, -0.2 ], 4 );
A.set( [ 3.0, 0.5 ], 5 );
A.set( [ 1.1, -0.4 ], 6 );
A.set( [ 0.4, 0.2 ], 7 );

info = zgeqrt3( 'column-major', 4, 2, A, 4, T, 2 );
console.log( info ); // eslint-disable-line no-console
