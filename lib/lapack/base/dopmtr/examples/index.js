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
import dopmtr from './../lib/index.js';

// AP and TAU from dsptrd('upper', 4, ...) on a symmetric packed matrix:
var AP = new Float64Array( [ 2.26, -0.09, 1.18, -0.58, 0.90, 5.56, -0.4, -0.2, 3.0, -1.0 ] ); // eslint-disable-line max-len
var TAU = new Float64Array( [ 0.0, 1.50, 1.67 ] );

// Apply Q to 4x4 identity from the left:
var C = new Float64Array( [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ] ); // eslint-disable-line max-len
var WORK = new Float64Array( 4 );

dopmtr.ndarray( 'left', 'upper', 'no-transpose', 4, 4, AP, 1, 0, TAU, 1, 0, C, 1, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'Q (columns of C):' );
console.log( C );
