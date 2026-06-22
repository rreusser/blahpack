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
import zsytrfrk from './../lib/index.js';

// Build a 4x4 complex symmetric matrix (lower triangle, column-major):

// A = [ 4+0.5i  1+2i    3-i     0.5+0.5i ;

//       1+2i    5-0.5i  2+i     1-2i     ;

//       3-i     2+i     7+i     3+0i     ;

//       0.5+0.5i 1-2i   3+0i    6-i      ]
var A = new Complex128Array([
	4,
	0.5,
	1,
	2,
	3,
	-1,
	0.5,
	0.5,
	0,
	0,
	5,
	-0.5,
	2,
	1,
	1,
	-2,
	0,
	0,
	0,
	0,
	7,
	1,
	3,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	6,
	-1
]);
var e = new Complex128Array( 4 );
var IPIV = new Int32Array( 4 );

var info = zsytrfrk( 'column-major', 'lower', 4, A, 4, e, 1, IPIV, 1 );

console.log( 'info = ' + info ); // eslint-disable-line no-console
console.log( 'IPIV = ' + IPIV.toString() ); // eslint-disable-line no-console
