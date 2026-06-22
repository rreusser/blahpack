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
import zpptrs from './../lib/index.js';

// Factored upper Cholesky of a 3x3 Hermitian positive definite matrix:
var AP = new Complex128Array( [ 3.162, 0.0, 0.949, -0.316, 2.646, 0.0, 0.316, 0.632, 0.718, -0.643, 2.138, 0.0 ] ); // eslint-disable-line max-len
var B = new Complex128Array( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );

var info = zpptrs.ndarray( 'upper', 3, 1, AP, 1, 0, B, 1, 3, 0 );
console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'x:', B ); // eslint-disable-line no-console
