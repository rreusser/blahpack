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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqz1 from './../lib/index.js';

// Column-major 3x3 matrices A and B:
var A = new Float64Array( [ 4.0, 2.0, 0.0, 1.0, 5.0, 3.0, 0.5, 1.0, 6.0 ] );
var B = new Float64Array( [ 2.0, 0.0, 0.0, 0.5, 3.0, 0.0, 0.1, 0.5, 4.0 ] );
var v = new Float64Array( 3 );

// Standard interface:
dlaqz1( 'column-major', A, 3, B, 3, 1.0, 2.0, 0.0, 1.0, 1.0, v, 1 );
console.log( v );

// ndarray interface:
v = new Float64Array( 3 );
dlaqz1.ndarray( A, 1, 3, 0, B, 1, 3, 0, 1.0, 2.0, 0.0, 1.0, 1.0, v, 1, 0 );
console.log( v );
