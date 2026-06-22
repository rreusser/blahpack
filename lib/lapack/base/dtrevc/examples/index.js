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
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import dtrevc from './../lib/index.js';

// 4x4 quasi-triangular matrix (column-major):

// [ 1   0.5  0.2  0.1 ]

// [ 0   2    0.3  0.15]

// [ 0   0    3   -0.5 ]

// [ 0   0    0.8  3   ]
var T = new Float64Array([
	1.0,
	0.0,
	0.0,
	0.0,
	0.5,
	2.0,
	0.0,
	0.0,
	0.2,
	0.3,
	3.0,
	0.8,
	0.1,
	0.15,
	-0.5,
	3.0
]);

var VL = new Float64Array( 16 );
var VR = new Float64Array( 16 );
var SELECT = new Uint8Array( 4 );
var WORK = new Float64Array( 12 );

// Compute right eigenvectors using the ndarray interface:
var info = dtrevc.ndarray( 'right', 'all', SELECT, 1, 0, 4, T, 1, 4, 0, VL, 1, 4, 0, VR, 1, 4, 0, 4, 0, WORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'VR:', VR ); // eslint-disable-line no-console
