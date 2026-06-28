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
import dlasyfRook from './../lib/index.js';

// 2x2 symmetric matrix [[4, 1], [1, 3]] in column-major order:
var A = new Float64Array( [ 4.0, 1.0, 1.0, 3.0 ] );
var IPIV = new Int32Array( 2 );
var W = new Float64Array( 4 );

// Factor up to nb=2 columns of the lower triangle using bounded Bunch-Kaufman:
var result = dlasyfRook( 'column-major', 'lower', 2, 2, A, 2, IPIV, W, 2 );
console.log( result );
console.log( A );
console.log( IPIV );
