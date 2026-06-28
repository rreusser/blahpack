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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytrsRook from './../lib/index.js';

// Solve a 1x1 system: 4*x = 8
var A = new Float64Array( [ 4.0 ] );
var ipiv = new Int32Array( [ 0 ] );
var b = new Float64Array( [ 8.0 ] );

dsytrsRook( 'column-major', 'lower', 1, 1, A, 1, ipiv, 1, b, 1 );
console.log( b ); // eslint-disable-line no-console
