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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlarz from './../lib/index.js';

// v stores the last L components of the reflector (the leading 1 is implicit):
var v = new Complex128Array( [ 0.5, 0.2, -0.3, 0.4 ] );

// Complex scalar tau:
var tau = new Complex128Array( [ 1.2, -0.4 ] );

// 4-by-3 column-major matrix C:
var C = new Complex128Array([
	1.0,
	0.0,
	2.0,
	1.0,
	3.0,
	-1.0,
	4.0,
	0.5,
	-1.0,
	2.0,
	0.5,
	0.5,
	1.5,
	-0.5,
	-2.0,
	1.0,
	0.0,
	1.0,
	1.0,
	1.0,
	-0.5,
	0.0,
	2.0,
	-2.0
]);

// Workspace (length >= N for side = 'left'):
var WORK = new Complex128Array( 3 );

// Apply H = I - tau * v * v^H from the left:
zlarz( 'column-major', 'left', 4, 3, 2, v, 1, tau, 0, C, 4, WORK, 1 );

console.log( C ); // eslint-disable-line no-console
