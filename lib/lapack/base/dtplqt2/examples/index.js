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
import dtplqt2 from './../lib/index.js';

// Lower triangular M-by-M matrix A (column-major)
var A = new Float64Array( [ 2.0, 0.5, 0.25, 0.0, 3.0, 0.75, 0.0, 0.0, 4.0 ] );

// Pentagonal M-by-N matrix B with l=2 lower-trapezoidal columns
var B = new Float64Array( [ 0.9, 0.2, 0.6, 0.0, 1.3, 0.4, 0.0, 0.0, 1.1 ] );

var T = new Float64Array( 9 );

var info = dtplqt2( 'column-major', 3, 3, 2, A, 3, B, 3, T, 3 );
console.log( 'info: ' + info ); // eslint-disable-line no-console
console.log( T ); // eslint-disable-line no-console
