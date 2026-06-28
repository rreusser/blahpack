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
import zgeqr2p from './../lib/index.js';

var M = 3;
var N = 2;

// Column-major 3x2 complex matrix
var A = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 1.0, 5.0, 1.0, 6.0, 1.0 ] ); // eslint-disable-line max-len
var TAU = new Complex128Array( 2 );
var WORK = new Complex128Array( 2 );

zgeqr2p( 'column-major', M, N, A, M, TAU, 1, WORK, 1 );

console.log( A ); // eslint-disable-line no-console
console.log( TAU ); // eslint-disable-line no-console
