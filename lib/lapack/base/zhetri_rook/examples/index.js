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
import zhetriRook from './../lib/index.js';

// 1x1 Hermitian factorization (already factored): A = [4 + 0i].
var A = new Complex128Array( [ 4.0, 0.0 ] );
var IPIV = new Int32Array( [ 0 ] );
var WORK = new Complex128Array( 1 );

var info = zhetriRook( 'column-major', 'upper', 1, A, 1, IPIV, 1, WORK );

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'A (inverse):', A ); // eslint-disable-line no-console
