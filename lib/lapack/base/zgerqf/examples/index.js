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
import zgerqf from './../lib/index.js';

// Define a 4-by-3 complex matrix in column-major layout (interleaved re/im):
var A = new Complex128Array([
	1.0,
	0.5,
	2.0,
	1.0,
	3.0,
	1.5,
	4.0,
	2.0,
	0.5,
	1.0,
	1.0,
	0.5,
	1.5,
	1.0,
	2.0,
	1.5,
	1.0,
	0.0,
	2.0,
	0.5,
	3.0,
	1.0,
	4.0,
	1.5
]);
var TAU = new Complex128Array( 3 );
var WORK = new Complex128Array( 256 );

var info = zgerqf( 'column-major', 4, 3, A, 4, TAU, 1, WORK, 1, -1 );
console.log( info ); // eslint-disable-line no-console
