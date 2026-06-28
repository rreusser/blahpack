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
import ztptrs from './../lib/index.js';

// 3x3 upper triangular packed: A = [2+i  1+2i  3; 0  4+i  5-i; 0  0  6+2i]
var AP = new Complex128Array( [ 2.0, 1.0, 1.0, 2.0, 4.0, 1.0, 3.0, 0.0, 5.0, -1.0, 6.0, 2.0 ] ); // eslint-disable-line max-len
var B = new Complex128Array( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );

var info = ztptrs.ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, AP, 1, 0, B, 1, 3, 0 ); // eslint-disable-line max-len
console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'x:', B ); // eslint-disable-line no-console
