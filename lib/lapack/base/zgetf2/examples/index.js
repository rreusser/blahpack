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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgetf2 from './../lib/index.js';

var IPIV;
var info;
var view;
var A;

// 3x3 complex matrix in column-major order:
A = new Complex128Array([
	2.0,
	1.0,
	4.0,
	2.0,
	8.0,
	3.0,
	1.0,
	0.5,
	3.0,
	1.0,
	7.0,
	2.0,
	1.0,
	0.1,
	3.0,
	0.5,
	9.0,
	1.0
]);
IPIV = new Int32Array( 3 );

info = zgetf2( 'column-major', 3, 3, A, 3, IPIV, 1 );

view = reinterpret( A, 0 );
console.log( 'LU factored matrix: [%s]', view.join( ', ' ) ); // eslint-disable-line no-console
console.log( 'Pivot indices (0-based): [%s]', IPIV.join( ', ' ) ); // eslint-disable-line no-console
console.log( 'Info: %d', info ); // eslint-disable-line no-console
