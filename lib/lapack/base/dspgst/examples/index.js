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
import dpptrf from './../../dpptrf/lib/index.js';
import dspgst from './../lib/index.js';

var info;
var AP;
var BP;

// 3x3 SPD matrix B in upper packed format: [4 2 1; 2 5 1; 1 1 3]
BP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 1.0, 3.0 ] );
dpptrf( 'upper', 3, BP );

// 3x3 symmetric matrix A in upper packed format: [4 2 1; 2 5 3; 1 3 6]
AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );

// Compute inv(U^T)*A*inv(U):
info = dspgst( 1, 'upper', 3, AP, BP );

console.log( 'info: %d', info ); // eslint-disable-line no-console
console.log( 'AP (packed):', AP ); // eslint-disable-line no-console
