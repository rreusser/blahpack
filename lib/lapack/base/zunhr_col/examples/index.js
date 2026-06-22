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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunhrCol from './../lib/index.js';

// 3x3 identity matrix Q_in (orthonormal columns), stored as Complex128 entries:
var M = 3;
var N = 3;
var nb = 1;
var A = new Complex128Array( M * N );
var view = reinterpret( A, 0 );
view[ 0 ] = 1.0; // (0,0)
view[ 2 * ( 1 + M ) ] = 1.0; // (1,1)
view[ 2 * ( 2 + ( 2 * M ) ) ] = 1.0; // (2,2)
var T = new Complex128Array( M * N );
var d = new Float64Array( N );

// Reconstruct the Householder vectors V (in A), block reflectors T, and sign vector d:
var info = zunhrCol( 'column-major', M, N, nb, A, M, T, M, d, 1 );
console.log( info );
console.log( d );
