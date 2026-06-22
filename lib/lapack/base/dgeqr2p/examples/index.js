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
import dgeqr2p from './../lib/index.js';

// Column-major 3-by-2 matrix A:
var A = new Float64Array( [ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ] );
var TAU = new Float64Array( 2 );
var WORK = new Float64Array( 2 );

var info = dgeqr2p( 'column-major', 3, 2, A, 3, TAU, 1, WORK, 1 );
console.log( 'INFO: ' + info );
console.log( 'R diagonal: ' + A[ 0 ] + ', ' + A[ 4 ] );
console.log( 'TAU: ' + TAU[ 0 ] + ', ' + TAU[ 1 ] );
