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
import dlatps from './../lib/index.js';

/*
* Upper triangular 3x3 matrix in packed storage:
*   A = [[2, 1, 1], [0, 3, 2], [0, 0, 4]]
*   packed: [2, 1, 3, 1, 2, 4]
*/
var AP = new Float64Array( [ 2.0, 1.0, 3.0, 1.0, 2.0, 4.0 ] );
var x = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var scale = new Float64Array( 1 );
var CNORM = new Float64Array( 3 );

dlatps( 'upper', 'no-transpose', 'non-unit', 'no', 3, AP, x, 1, scale, CNORM, 1 ); // eslint-disable-line max-len

console.log( 'x:', x );
console.log( 'scale:', scale[ 0 ] );
console.log( 'cnorm:', CNORM );
