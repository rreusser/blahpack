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
import zhetri2x from './../lib/index.js';

// Trivial 1x1 Hermitian inversion: inv([0.5+0i]) = [2+0i].
var N = 1;
var LDA = 1;
var nb = 2;
var ldwork = N + nb + 1;

var A = new Complex128Array( [ 0.5, 0.0 ] );
var IPIV = new Int32Array( [ 0 ] );
var WORK = new Complex128Array( ldwork * ( nb + 3 ) );

var info = zhetri2x( 'column-major', 'lower', N, A, LDA, IPIV, 1, 0, WORK, 1, nb );
console.log( 'info = ' + info ); // eslint-disable-line no-console
console.log( 'inv(A) = ' + A.get( 0 ).re + ' + ' + A.get( 0 ).im + 'i' ); // eslint-disable-line no-console
