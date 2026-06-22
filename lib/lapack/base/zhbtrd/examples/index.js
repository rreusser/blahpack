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
import zhbtrd from './../lib/index.js';

// 4x4 Hermitian tridiagonal (KD=1), upper band storage (LDAB=2):

var AB = new Complex128Array( 8 );
AB.set( [ 4, 0 ], 1 );
AB.set( [ 1, 1 ], 2 );
AB.set( [ 5, 0 ], 3 );
AB.set( [ 2, -1 ], 4 );
AB.set( [ 6, 0 ], 5 );
AB.set( [ 3, 1 ], 6 );
AB.set( [ 7, 0 ], 7 );
var d = new Float64Array( 4 );
var e = new Float64Array( 3 );
var Q = new Complex128Array( 16 );
var WORK = new Complex128Array( 4 );

zhbtrd( 'column-major', 'initialize', 'upper', 4, 1, AB, 2, d, e, Q, 4, WORK );

console.log( 'Diagonal (d):', d ); // eslint-disable-line no-console
console.log( 'Off-diagonal (e):', e ); // eslint-disable-line no-console
