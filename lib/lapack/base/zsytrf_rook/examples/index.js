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
import zsytrfRook from './../lib/index.js';

var IPIV = new Int32Array( 4 );

// 4x4 complex symmetric indefinite matrix (column-major, lower triangle):
var A = new Complex128Array([
	0.0,
	0.0,
	1.0,
	0.0,
	2.0,
	0.0,
	3.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	4.0,
	0.0,
	5.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	6.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0
]);

// Using the standard interface:
var out = zsytrfRook( 'column-major', 'lower', 4, A, 4, IPIV, 1 );
console.log( out );

// Using the ndarray interface:
out = zsytrfRook.ndarray( 'lower', 4, A, 1, 4, 0, IPIV, 1, 0 );
console.log( out );
