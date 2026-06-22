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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlasyfAa from './../lib/index.js';

// Complex symmetric 3x3 matrix (column-major lower triangle):
var A = new Complex128Array([
	4.0,
	0.5,
	1.0,
	-0.3,
	2.0,
	0.2,
	0.0,
	0.0,
	5.0,
	0.3,
	1.5,
	-0.4,
	0.0,
	0.0,
	0.0,
	0.0,
	6.0,
	-0.2
]);
var H = new Complex128Array( 9 );
var WORK = new Complex128Array( 3 );
var IPIV = new Int32Array( 3 );

zlasyfAa( 'column-major', 'lower', 1, 3, 3, A, 3, IPIV, 1, 0, H, 3, WORK, 1 );
console.log( A );
console.log( IPIV );
