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
import zgelqt3 from './../lib/index.js';

// 2x4 complex matrix in column-major order; T is M-by-M = 2-by-2.
var A = new Complex128Array( 8 );
var T = new Complex128Array( 4 );
var info;

A.set( [ 2.0, 0.1 ], 0 );
A.set( [ 0.7, -0.3 ], 1 );
A.set( [ 1.5, -0.2 ], 2 );
A.set( [ 3.0, 0.5 ], 3 );
A.set( [ 0.5, 0.3 ], 4 );
A.set( [ 1.1, -0.4 ], 5 );
A.set( [ -1.0, 0.4 ], 6 );
A.set( [ 0.4, 0.2 ], 7 );

info = zgelqt3( 'column-major', 2, 4, A, 2, T, 2 );
console.log( info ); // eslint-disable-line no-console
