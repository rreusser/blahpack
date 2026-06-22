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
import dppsv from './../lib/index.js';

/*
* Solve a 3x3 symmetric positive definite system A*x = b using upper packed storage:
* A = [ 4  2  1; 2  5  3; 1  3  6 ]
* Upper packed: [ 4, 2, 5, 1, 3, 6 ]
* b = A * [1,1,1]^T = [7, 10, 10]
*/

var AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
var B = new Float64Array( [ 7.0, 10.0, 10.0 ] );

var info = dppsv( 'upper', 3, 1, AP, B, 3 );

console.log( 'info:', info );
console.log( 'Solution x:', B );
// => x = [1, 1, 1]
