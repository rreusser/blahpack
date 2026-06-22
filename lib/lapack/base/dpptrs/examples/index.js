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
import dpptrs from './../lib/index.js';

// Factored upper Cholesky of A = [4 2 1; 2 5 3; 1 3 9]:
var AP = new Float64Array( [ 2.0, 1.0, 2.0, 0.5, 1.25, 2.68095132369090194 ] );
var B = new Float64Array( [ 1.0, 2.0, 3.0 ] );

var info = dpptrs.ndarray( 'upper', 3, 1, AP, 1, 0, B, 1, 3, 0 );
console.log( 'info:', info );
console.log( 'x:', B );
